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

    // Create a dedicated router for swagger auth routes
    const swaggerAuthRouter = Router();

    // Apply session only to this router
    swaggerAuthRouter.use(sessionMiddleware);

    // Parse JSON body for login endpoint
    swaggerAuthRouter.use('/login', (req, res, next) => {
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
    swaggerAuthRouter.get('/login', (req: Request, res: Response) => {
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
    swaggerAuthRouter.post('/login', (req: Request, res: Response) => {
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

    // Logout route
    swaggerAuthRouter.get('/logout', (req: Request, res: Response) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
            }
            res.redirect('/api/login');
        });
    });

    // Swagger UI protection - only for the root /api path and swagger assets
    // This checks for swagger-specific routes and protects them
    swaggerAuthRouter.get(
        ['/', '/-json', '/swagger-ui-init.js', '/swagger-ui.css', '/swagger-ui-bundle.js', '/swagger-ui-standalone-preset.js'],
        (req: Request, res: Response, next: NextFunction) => {
            // Check if authenticated
            if (req.session?.authenticated) {
                return next();
            }

            // For browser requests, redirect to login
            res.redirect('/api/login');
        },
    );

    // Mount the swagger auth router on /api
    app.use('/api', swaggerAuthRouter);
}

