/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Requirements_LowercaseInputs */

const en_auth_common_requirements_lowercase = /** @type {(inputs: Auth_Common_Requirements_LowercaseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lowercase letter (a–z)`)
};

const cs_auth_common_requirements_lowercase = /** @type {(inputs: Auth_Common_Requirements_LowercaseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Malé písmeno (a–z)`)
};

/**
* | output |
* | --- |
* | "Lowercase letter (a–z)" |
*
* @param {Auth_Common_Requirements_LowercaseInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_requirements_lowercase = /** @type {((inputs?: Auth_Common_Requirements_LowercaseInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Requirements_LowercaseInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_requirements_lowercase(inputs)
	return cs_auth_common_requirements_lowercase(inputs)
});
export { auth_common_requirements_lowercase as "auth.common.requirements.lowercase" }