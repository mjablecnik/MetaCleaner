/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Requirements_Min8Inputs */

const en_auth_common_requirements_min8 = /** @type {(inputs: Auth_Common_Requirements_Min8Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`At least 8 characters`)
};

const cs_auth_common_requirements_min8 = /** @type {(inputs: Auth_Common_Requirements_Min8Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alespoň 8 znaků`)
};

/**
* | output |
* | --- |
* | "At least 8 characters" |
*
* @param {Auth_Common_Requirements_Min8Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_requirements_min8 = /** @type {((inputs?: Auth_Common_Requirements_Min8Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Requirements_Min8Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_requirements_min8(inputs)
	return cs_auth_common_requirements_min8(inputs)
});
export { auth_common_requirements_min8 as "auth.common.requirements.min8" }