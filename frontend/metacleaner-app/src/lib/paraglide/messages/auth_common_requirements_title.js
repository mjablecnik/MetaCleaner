/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Requirements_TitleInputs */

const en_auth_common_requirements_title = /** @type {(inputs: Auth_Common_Requirements_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Password requirements`)
};

const cs_auth_common_requirements_title = /** @type {(inputs: Auth_Common_Requirements_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Požadavky na heslo`)
};

/**
* | output |
* | --- |
* | "Password requirements" |
*
* @param {Auth_Common_Requirements_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_requirements_title = /** @type {((inputs?: Auth_Common_Requirements_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Requirements_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_requirements_title(inputs)
	return cs_auth_common_requirements_title(inputs)
});
export { auth_common_requirements_title as "auth.common.requirements.title" }