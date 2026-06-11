/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Requirements_SpecialInputs */

const en_auth_common_requirements_special = /** @type {(inputs: Auth_Common_Requirements_SpecialInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Special character (!@#$%)`)
};

const cs_auth_common_requirements_special = /** @type {(inputs: Auth_Common_Requirements_SpecialInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Speciální znak (!@#$%)`)
};

/**
* | output |
* | --- |
* | "Special character (!@#$%)" |
*
* @param {Auth_Common_Requirements_SpecialInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_requirements_special = /** @type {((inputs?: Auth_Common_Requirements_SpecialInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Requirements_SpecialInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_requirements_special(inputs)
	return cs_auth_common_requirements_special(inputs)
});
export { auth_common_requirements_special as "auth.common.requirements.special" }