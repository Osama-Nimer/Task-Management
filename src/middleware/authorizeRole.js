import jwt from "jsonwebtoken";

function authorizeRole(requiredRole) {
    return function (req, res, next) {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== requiredRole) {
                return res.status(403).json({ message: `Access denied. ${requiredRole}s only.` });
            }
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Invalid token' });
        }
    };
}

export default authorizeRole;