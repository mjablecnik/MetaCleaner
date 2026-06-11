/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Requirements_Uppercasefull1Inputs */

const en_auth_common_requirements_uppercasefull1 = /** @type {(inputs: Auth_Common_Requirements_Uppercasefull1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Uppercase letter (A–Z)`)
};

const cs_auth_common_requirements_uppercasefull1 = /** @type {(inputs: Auth_Common_Requirements_Uppercasefull1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Velké písmeno (A–Z)`)
};

/**
* | output |
* | --- |
* | "Uppercase letter (A–Z)" |
*
* @param {Auth_Common_Requirements_Uppercasefull1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_requirements_uppercasefull1 = /** @type {((inputs?: Auth_Common_Requirements_Uppercasefull1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Requirements_Uppercasefull1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_requirements_uppercasefull1(inputs)
	return cs_auth_common_requirements_uppercasefull1(inputs)
});
export { auth_common_requirements_uppercasefull1 as "auth.common.requirements.uppercaseFull" }