/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Divider_Oremail1Inputs */

const en_auth_common_divider_oremail1 = /** @type {(inputs: Auth_Common_Divider_Oremail1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`or with email`)
};

const cs_auth_common_divider_oremail1 = /** @type {(inputs: Auth_Common_Divider_Oremail1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`nebo emailem`)
};

/**
* | output |
* | --- |
* | "or with email" |
*
* @param {Auth_Common_Divider_Oremail1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_divider_oremail1 = /** @type {((inputs?: Auth_Common_Divider_Oremail1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Divider_Oremail1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_divider_oremail1(inputs)
	return cs_auth_common_divider_oremail1(inputs)
});
export { auth_common_divider_oremail1 as "auth.common.divider.orEmail" }