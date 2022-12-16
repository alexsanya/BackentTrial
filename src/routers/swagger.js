const path = require('path');
const express = require('express')
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const swaggerDocument = YAML.load(path.join(process.cwd(), 'src', 'swagger.yaml'));

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

module.exports = router
