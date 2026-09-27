/**
 * ==============================================================================
 * Company Profile Controller: Statutory Master Data (MongoDB Atlas)
 * Powers: AdminDashboard.jsx & Statutory GST Invoices
 * ==============================================================================
 */

const { jsonResponse } = require('../config/db');
const { CompanyProfile } = require('../models');

/**
 * Fetch Official Statutory Company Profile
 * GET /api/company or GET /company.php
 */
exports.getCompanyProfile = async (req, res) => {
  try {
    let profile = await CompanyProfile.findOne();

    if (!profile) {
      profile = await CompanyProfile.create({
        name: 'PANDHARKARS INFOTECH PRIVATE LIMITED',
        short_name: 'Pandharkars Infotech',
        tagline: 'We Manage, Control & Grow Your Business!',
        cin: 'U72900MH2021PTC366004',
        gstin: '27AAMCP2248L1ZY',
        email: 'sales@pandharkarsinfotech.com',
        phone: '+91 98220 12345 / +91 (020) 2456-7890',
        address: 'Level 4, Infotech Tower, Baner Tech Park, Pune, Maharashtra - 411045, India',
        bank_name: 'HDFC Bank Ltd',
        bank_account_number: '50200087462910',
        bank_ifsc: 'HDFC0001234',
        upi_id: 'pandharkarsinfotech@hdfcbank'
      });
    }

    const formatted = {
      id: 1,
      name: profile.name,
      shortName: profile.short_name,
      tagline: profile.tagline,
      cin: profile.cin,
      gstin: profile.gstin,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      bankDetails: {
        bankName: profile.bank_name,
        accountNumber: profile.bank_account_number,
        ifscCode: profile.bank_ifsc,
        upiId: profile.upi_id
      }
    };

    return jsonResponse(res, true, formatted, 'Company profile fetched successfully.');
  } catch (err) {
    return jsonResponse(res, false, null, `Error fetching profile: ${err.message}`, 500);
  }
};

/**
 * Update Statutory Company Profile
 * PUT or POST /api/company or /company.php
 */
exports.updateCompanyProfile = async (req, res) => {
  const body = req.body;
  const bankDetails = body.bankDetails || {};

  try {
    const updateFields = {};
    if (body.name !== undefined) updateFields.name = body.name;
    if (body.shortName !== undefined || body.short_name !== undefined) {
      updateFields.short_name = body.shortName || body.short_name;
    }
    if (body.tagline !== undefined) updateFields.tagline = body.tagline;
    if (body.cin !== undefined) updateFields.cin = body.cin;
    if (body.gstin !== undefined) updateFields.gstin = body.gstin;
    if (body.email !== undefined) updateFields.email = body.email;
    if (body.phone !== undefined) updateFields.phone = body.phone;
    if (body.address !== undefined) updateFields.address = body.address;

    if (bankDetails.bankName !== undefined || body.bank_name !== undefined) {
      updateFields.bank_name = bankDetails.bankName || body.bank_name;
    }
    if (bankDetails.accountNumber !== undefined || body.bank_account_number !== undefined) {
      updateFields.bank_account_number = bankDetails.accountNumber || body.bank_account_number;
    }
    if (bankDetails.ifscCode !== undefined || body.bank_ifsc !== undefined) {
      updateFields.bank_ifsc = bankDetails.ifscCode || body.bank_ifsc;
    }
    if (bankDetails.upiId !== undefined || body.upi_id !== undefined) {
      updateFields.upi_id = bankDetails.upiId || body.upi_id;
    }

    await CompanyProfile.findOneAndUpdate({}, { $set: updateFields }, { new: true, upsert: true });

    return jsonResponse(res, true, null, 'Company profile updated successfully.');
  } catch (err) {
    return jsonResponse(res, false, null, `Error updating profile: ${err.message}`, 500);
  }
};
