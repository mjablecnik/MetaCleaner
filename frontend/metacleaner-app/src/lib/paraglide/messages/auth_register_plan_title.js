/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Plan_TitleInputs */

const en_auth_register_plan_title = /** @type {(inputs: Auth_Register_Plan_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose your plan`)
};

const cs_auth_register_plan_title = /** @type {(inputs: Auth_Register_Plan_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vyberte svůj plán`)
};

/**
* | output |
* | --- |
* | "Choose your plan" |
*
* @param {Auth_Register_Plan_TitleInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_plan_title = /** @type {((inputs?: Auth_Register_Plan_TitleInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Plan_TitleInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_plan_title(inputs)
	return cs_auth_register_plan_title(inputs)
});
export { auth_register_plan_title as "auth.register.plan.title" }