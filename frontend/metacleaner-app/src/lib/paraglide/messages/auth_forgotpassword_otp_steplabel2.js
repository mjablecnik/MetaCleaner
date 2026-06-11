/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Forgotpassword_Otp_Steplabel2Inputs */

const en_auth_forgotpassword_otp_steplabel2 = /** @type {(inputs: Auth_Forgotpassword_Otp_Steplabel2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Step 2 of 3`)
};

const cs_auth_forgotpassword_otp_steplabel2 = /** @type {(inputs: Auth_Forgotpassword_Otp_Steplabel2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Krok 2 ze 3`)
};

/**
* | output |
* | --- |
* | "Step 2 of 3" |
*
* @param {Auth_Forgotpassword_Otp_Steplabel2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_otp_steplabel2 = /** @type {((inputs?: Auth_Forgotpassword_Otp_Steplabel2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Otp_Steplabel2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_forgotpassword_otp_steplabel2(inputs)
	return cs_auth_forgotpassword_otp_steplabel2(inputs)
});
export { auth_forgotpassword_otp_steplabel2 as "auth.forgotPassword.otp.stepLabel" }