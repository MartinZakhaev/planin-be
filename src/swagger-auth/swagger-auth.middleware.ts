import { Request, Response, NextFunction, Express, Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import session from 'express-session';

// Extend express-session types
declare module 'express-session' {
    interface SessionData {
        authenticated?: boolean;
    }
}

/**
 * Configuration for Swagger/API Docs authentication
 */
interface SwaggerAuthConfig {
    username: string;
    password: string;
    sessionSecret: string;
}

/**
 * Setup authentication middleware for Swagger/API documentation
 * This protects the /api route with a login page
 * IMPORTANT: Only applies session to swagger-related routes, not to NestJS API routes
 */
export function setupSwaggerAuth(
    app: Express,
    config: SwaggerAuthConfig,
): void {
    // Create session middleware instance (not applied globally)
    const sessionMiddleware = session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        name: 'swagger.sid', // Different name to avoid conflicts
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
    });

    const loginRouter = Router();
    const docsRouter = Router();

    // Parse JSON body for login endpoint only.
    loginRouter.use((req, res, next) => {
        if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => (body += chunk));
            req.on('end', () => {
                try {
                    (req as any).body = JSON.parse(body);
                } catch {
                    (req as any).body = {};
                }
                next();
            });
        } else {
            next();
        }
    });

    // Login page route
    loginRouter.get('/', (req: Request, res: Response) => {
        // If already authenticated, redirect to docs
        if (req.session?.authenticated) {
            return res.redirect('/api');
        }

        const loginPagePath = path.join(__dirname, 'docs-login.html');
        try {
            const htmlContent = fs.readFileSync(loginPagePath, 'utf-8');
            res.setHeader('Content-Type', 'text/html');
            res.send(htmlContent);
        } catch (error) {
            console.error('Failed to load login page:', error);
            res.status(500).send('Login page not found');
        }
    });

    // Login POST handler
    loginRouter.post('/', (req: Request, res: Response) => {
        const { username, password } = (req as any).body || {};

        if (username === config.username && password === config.password) {
            req.session.authenticated = true;
            req.session.save((err) => {
                if (err) {
                    console.error('Session save error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Session error',
                    });
                }
                res.json({ success: true });
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid username or password',
            });
        }
    });

    // Swagger UI protection - only for the root /api path and swagger assets
    // Keep this scoped to docs/login URLs so business APIs under /api/* do not
    // receive express-session. Better Auth also uses req.session semantics, and
    // mixing both on regular API routes can break express-session's response hook.
    docsRouter.use((req: Request, res: Response, next: NextFunction) => {
        if (req.session?.authenticated) {
            return next();
        }

        res.redirect('/api/login');
    });

    app.use('/api/login', sessionMiddleware, loginRouter);
    app.get('/api/logout', sessionMiddleware, (req: Request, res: Response) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
            }
            res.redirect('/api/login');
        });
    });
    app.get('/api', sessionMiddleware, docsRouter);
    app.get('/api/', sessionMiddleware, docsRouter);
    app.get('/api/-json', sessionMiddleware, docsRouter);
    app.get('/api/swagger-ui-init.js', sessionMiddleware, docsRouter);
    app.get('/api/swagger-ui.css', sessionMiddleware, docsRouter);
    app.get('/api/swagger-ui-bundle.js', sessionMiddleware, docsRouter);
    app.get('/api/swagger-ui-standalone-preset.js', sessionMiddleware, docsRouter);
}
