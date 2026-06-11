/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Requirements_NumberInputs */

const en_auth_common_requirements_number = /** @type {(inputs: Auth_Common_Requirements_NumberInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Number`)
};

const cs_auth_common_requirements_number = /** @type {(inputs: Auth_Common_Requirements_NumberInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Číslo`)
};

/**
* | output |
* | --- |
* | "Number" |
*
* @param {Auth_Common_Requirements_NumberInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_requirements_number = /** @type {((inputs?: Auth_Common_Requirements_NumberInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Requirements_NumberInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_requirements_number(inputs)
	return cs_auth_common_requirements_number(inputs)
});
export { auth_common_requirements_number as "auth.common.requirements.number" }