import jwt from "jsonwebtoken";

function authorizeRole(...requiredRole ) {
    return function (req, res, next) {
        const token = req.cookies.token ;

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!requiredRole.includes(decoded.role)) {
                return res.status(403).json({ message: `Access denied. Only [${requiredRole.join(', ')}] roles are allowed.` });
            }
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    };
}

export default authorizeRole;