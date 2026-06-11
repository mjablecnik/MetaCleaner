/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Requirements_Numberfull1Inputs */

const en_auth_common_requirements_numberfull1 = /** @type {(inputs: Auth_Common_Requirements_Numberfull1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Number (0–9)`)
};

const cs_auth_common_requirements_numberfull1 = /** @type {(inputs: Auth_Common_Requirements_Numberfull1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Číslo (0–9)`)
};

/**
* | output |
* | --- |
* | "Number (0–9)" |
*
* @param {Auth_Common_Requirements_Numberfull1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_requirements_numberfull1 = /** @type {((inputs?: Auth_Common_Requirements_Numberfull1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Requirements_Numberfull1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_requirements_numberfull1(inputs)
	return cs_auth_common_requirements_numberfull1(inputs)
});
export { auth_common_requirements_numberfull1 as "auth.common.requirements.numberFull" }