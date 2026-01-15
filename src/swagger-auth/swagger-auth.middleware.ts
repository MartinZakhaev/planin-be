import { Request, Response, NextFunction, Express } from 'express';
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
 */
export function setupSwaggerAuth(app: Express, config: SwaggerAuthConfig): void {
    // Session configuration
    app.use(
        session({
            secret: config.sessionSecret,
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
            },
        }),
    );

    // Parse JSON body for login endpoint
    app.use('/api/login', (req, res, next) => {
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
    app.get('/api/login', (req: Request, res: Response) => {
        // If already authenticated, redirect to docs
        if (req.session?.authenticated) {
            return res.redirect('/api');
        }

        const loginPagePath = path.join(__dirname, 'docs-login.html');
        const htmlContent = fs.readFileSync(loginPagePath, 'utf-8');
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlContent);
    });

    // Login POST handler
    app.post('/api/login', (req: Request, res: Response) => {
        const { username, password } = (req as any).body || {};

        if (username === config.username && password === config.password) {
            req.session.authenticated = true;
            req.session.save((err) => {
                if (err) {
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
    app.get('/api/logout', (req: Request, res: Response) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
            }
            res.redirect('/api/login');
        });
    });

    // Protect /api routes (but not /api/login, /api/logout, /api/auth/*)
    app.use(
        '/api',
        (req: Request, res: Response, next: NextFunction) => {
            // Skip authentication for login/logout routes
            if (req.path === '/login' || req.path === '/logout') {
                return next();
            }

            // Skip authentication for Better Auth routes
            if (req.path.startsWith('/auth/') || req.originalUrl.startsWith('/api/auth/')) {
                return next();
            }

            // Check if authenticated
            if (req.session?.authenticated) {
                return next();
            }

            // For API JSON requests, return 401
            if (req.headers.accept?.includes('application/json')) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required',
                });
            }

            // For browser requests, redirect to login
            res.redirect('/api/login');
        },
    );
}
