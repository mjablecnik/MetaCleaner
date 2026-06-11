/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Step_Currentstep2Inputs */

const en_auth_checkemail_step_currentstep2 = /** @type {(inputs: Auth_Checkemail_Step_Currentstep2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Current step`)
};

const cs_auth_checkemail_step_currentstep2 = /** @type {(inputs: Auth_Checkemail_Step_Currentstep2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aktuální krok`)
};

/**
* | output |
* | --- |
* | "Current step" |
*
* @param {Auth_Checkemail_Step_Currentstep2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_step_currentstep2 = /** @type {((inputs?: Auth_Checkemail_Step_Currentstep2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Step_Currentstep2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_step_currentstep2(inputs)
	return cs_auth_checkemail_step_currentstep2(inputs)
});
export { auth_checkemail_step_currentstep2 as "auth.checkEmail.step.currentStep" }