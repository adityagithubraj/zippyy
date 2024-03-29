const authorize = (role = [ 'admin', 'deliveryPartner']) => {
    // roles param can be a single role string (e.g. 'admin') or an array of roles (e.g. ['admin', 'user'])
    if (typeof role === 'string') {
        role = [role];
    }

    return (req, res, next) => {
        if (!req.user || role.length && !role.includes(req.user.role)) {
            // user's role is not authorized
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // authentication and authorization successful
        next();
    };
};
module.exports = {
    authorize
};