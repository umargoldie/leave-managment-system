const requireRole = (allowedRoles = []) => {
  return async (request, reply) => {
    if (!request.user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
  };
};

module.exports = {
  requireRole
};
