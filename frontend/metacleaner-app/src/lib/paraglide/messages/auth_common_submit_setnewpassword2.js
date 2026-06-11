/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Submit_Setnewpassword2Inputs */

const en_auth_common_submit_setnewpassword2 = /** @type {(inputs: Auth_Common_Submit_Setnewpassword2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set new password`)
};

const cs_auth_common_submit_setnewpassword2 = /** @type {(inputs: Auth_Common_Submit_Setnewpassword2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nastavit nové heslo`)
};

/**
* | output |
* | --- |
* | "Set new password" |
*
* @param {Auth_Common_Submit_Setnewpassword2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_submit_setnewpassword2 = /** @type {((inputs?: Auth_Common_Submit_Setnewpassword2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Submit_Setnewpassword2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_submit_setnewpassword2(inputs)
	return cs_auth_common_submit_setnewpassword2(inputs)
});
export { auth_common_submit_setnewpassword2 as "auth.common.submit.setNewPassword" }