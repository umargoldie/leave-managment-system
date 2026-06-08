const authMiddleware = async (request, reply) => {
  const authHeader = request.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  try {
    request.user = await request.jwt.verify(token);
  } catch (error) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
};

module.exports = {
  authMiddleware
};
