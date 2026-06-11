/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Forgotpassword_Submit_Sendcode2Inputs */

const en_auth_forgotpassword_submit_sendcode2 = /** @type {(inputs: Auth_Forgotpassword_Submit_Sendcode2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send code`)
};

const cs_auth_forgotpassword_submit_sendcode2 = /** @type {(inputs: Auth_Forgotpassword_Submit_Sendcode2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Odeslat kód`)
};

/**
* | output |
* | --- |
* | "Send code" |
*
* @param {Auth_Forgotpassword_Submit_Sendcode2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_forgotpassword_submit_sendcode2 = /** @type {((inputs?: Auth_Forgotpassword_Submit_Sendcode2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Forgotpassword_Submit_Sendcode2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_forgotpassword_submit_sendcode2(inputs)
	return cs_auth_forgotpassword_submit_sendcode2(inputs)
});
export { auth_forgotpassword_submit_sendcode2 as "auth.forgotPassword.submit.sendCode" }