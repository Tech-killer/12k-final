/**
 * ==============================================================================
 * Company Routes: Statutory Profile Master
 * ==============================================================================
 */

const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

router.get('/', companyController.getCompanyProfile);
router.put('/', companyController.updateCompanyProfile);
router.post('/', companyController.updateCompanyProfile);

module.exports = router;
