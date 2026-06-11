/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Plan_Prodesc1Inputs */

const en_auth_register_plan_prodesc1 = /** @type {(inputs: Auth_Register_Plan_Prodesc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unlimited · All formats · Priority`)
};

const cs_auth_register_plan_prodesc1 = /** @type {(inputs: Auth_Register_Plan_Prodesc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Neomezeno · Všechny formáty · Priority`)
};

/**
* | output |
* | --- |
* | "Unlimited · All formats · Priority" |
*
* @param {Auth_Register_Plan_Prodesc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_plan_prodesc1 = /** @type {((inputs?: Auth_Register_Plan_Prodesc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Plan_Prodesc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_plan_prodesc1(inputs)
	return cs_auth_register_plan_prodesc1(inputs)
});
export { auth_register_plan_prodesc1 as "auth.register.plan.proDesc" }