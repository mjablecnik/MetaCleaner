/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Requirements_UppercaseInputs */

const en_auth_common_requirements_uppercase = /** @type {(inputs: Auth_Common_Requirements_UppercaseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Uppercase letter`)
};

const cs_auth_common_requirements_uppercase = /** @type {(inputs: Auth_Common_Requirements_UppercaseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Velké písmeno`)
};

/**
* | output |
* | --- |
* | "Uppercase letter" |
*
* @param {Auth_Common_Requirements_UppercaseInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_requirements_uppercase = /** @type {((inputs?: Auth_Common_Requirements_UppercaseInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Requirements_UppercaseInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_requirements_uppercase(inputs)
	return cs_auth_common_requirements_uppercase(inputs)
});
export { auth_common_requirements_uppercase as "auth.common.requirements.uppercase" }