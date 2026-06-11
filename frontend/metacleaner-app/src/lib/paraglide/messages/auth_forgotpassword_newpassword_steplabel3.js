/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Forgotpassword_Newpassword_Steplabel3Inputs */

const en_auth_forgotpassword_newpassword_steplabel3 = /** @type {(inputs: Auth_Forgotpassword_Newpassword_Steplabel3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Step 3 of 3`)
};

const cs_auth_forgotpassword_newpassword_steplabel3 = /** @type {(inputs: Auth_Forgotpassword_Newpassword_Steplabel3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Krok 3 ze 3`)
};

/**
* | output |
* | --- |
* | "Step 3 of 3" |
*
* @param {Auth_Forgotpassword_Newpassword_Steplabel3Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_newpassword_steplabel3 = /** @type {((inputs?: Auth_Forgotpassword_Newpassword_Steplabel3Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Newpassword_Steplabel3Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_forgotpassword_newpassword_steplabel3(inputs)
	return cs_auth_forgotpassword_newpassword_steplabel3(inputs)
});
export { auth_forgotpassword_newpassword_steplabel3 as "auth.forgotPassword.newPassword.stepLabel" }