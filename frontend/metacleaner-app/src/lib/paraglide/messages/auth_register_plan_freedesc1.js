/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Plan_Freedesc1Inputs */

const en_auth_register_plan_freedesc1 = /** @type {(inputs: Auth_Register_Plan_Freedesc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`50 files / month · JPG, PNG`)
};

const cs_auth_register_plan_freedesc1 = /** @type {(inputs: Auth_Register_Plan_Freedesc1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`50 souborů / měsíc · JPG, PNG`)
};

/**
* | output |
* | --- |
* | "50 files / month · JPG, PNG" |
*
* @param {Auth_Register_Plan_Freedesc1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_plan_freedesc1 = /** @type {((inputs?: Auth_Register_Plan_Freedesc1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Plan_Freedesc1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_plan_freedesc1(inputs)
	return cs_auth_register_plan_freedesc1(inputs)
});
export { auth_register_plan_freedesc1 as "auth.register.plan.freeDesc" }