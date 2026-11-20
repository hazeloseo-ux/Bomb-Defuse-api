// One line per endpoint: verb + path, rules, validate, controller.
const uploadCover = require('../middlewares/upload-cover');
const { Router } = require('express');
const requireUser = require('../middlewares/require-user');
const validate = require('../middlewares/validate');
const rules = require('../validators/question-set.validator');
const controller = require('../controllers/question-set.controller');
const questionRules = require('../validators/question.validator');
const questionController = require('../controllers/question.controller');
const router = Router();

// Every question-set endpoint is for hosts.
router.use(requireUser('HOST'));

router.get('/', rules.listRules, validate, controller.list);
router.post('/', rules.createRules, validate, controller.create);
router.get('/:id', rules.getRules, validate, controller.get);
router.patch('/:id', rules.updateRules, validate, controller.update);
router.delete('/:id', rules.idParam, validate, controller.remove);
// Questions live under their set.
router.get('/:id/questions', questionRules.listRules, validate, questionController.list);
router.post('/:id/questions', questionRules.createRules, validate, questionController.create);
router.patch('/:id/questions/:questionId', questionRules.updateRules, validate, questionController.update);
router.delete('/:id/questions/:questionId', questionRules.removeRules, validate, questionController.remove);
router.put('/:id/cover', rules.idParam, validate, uploadCover, controller.uploadCover);
module.exports = router;