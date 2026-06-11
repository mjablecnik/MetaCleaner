/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Plan_Freename1Inputs */

const en_auth_register_plan_freename1 = /** @type {(inputs: Auth_Register_Plan_Freename1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Free`)
};

const cs_auth_register_plan_freename1 = /** @type {(inputs: Auth_Register_Plan_Freename1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Free`)
};

/**
* | output |
* | --- |
* | "Free" |
*
* @param {Auth_Register_Plan_Freename1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_plan_freename1 = /** @type {((inputs?: Auth_Register_Plan_Freename1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Plan_Freename1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_plan_freename1(inputs)
	return cs_auth_register_plan_freename1(inputs)
});
export { auth_register_plan_freename1 as "auth.register.plan.freeName" }