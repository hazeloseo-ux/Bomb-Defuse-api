// One line per endpoint: verb + path, rules, validate, controller.
const { Router } = require('express');
const requireUser = require('../middlewares/require-user');
const validate = require('../middlewares/validate');
const rules = require('../validators/auth.validator');
const controller = require('../controllers/user.controller');

const router = Router();

// Every account-management endpoint is for admins. The guard runs before
// validation, so strangers learn nothing about the rules.
router.use(requireUser('ADMIN'));

router.get('/', controller.list);
router.patch('/:id/role', rules.roleRules, validate, controller.changeRole);

module.exports = router;