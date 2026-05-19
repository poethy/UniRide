const prisma = require('../utils/prisma');
const { fail } = require('../utils/response');

const permit = (modulo, accion) => async (req, res, next) => {
  const userId = req.user.id;

  const result = await prisma.$queryRaw`
    SELECT p.id
    FROM permisos p
    JOIN roles_permisos rp ON rp.permiso_id = p.id
    JOIN usuarios_roles ur ON ur.rol_id = rp.rol_id
    WHERE ur.usuario_id = ${userId}
      AND p.modulo = ${modulo}
      AND p.accion = ${accion}
    LIMIT 1
  `;

  if (!result.length) return fail(res, 'Sin permiso para esta acción', 403);
  next();
};

module.exports = { permit };
