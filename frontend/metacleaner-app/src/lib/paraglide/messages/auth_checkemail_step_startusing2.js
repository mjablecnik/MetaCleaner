/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Checkemail_Step_Startusing2Inputs */

const en_auth_checkemail_step_startusing2 = /** @type {(inputs: Auth_Checkemail_Step_Startusing2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Start using MetaCleaner`)
};

const cs_auth_checkemail_step_startusing2 = /** @type {(inputs: Auth_Checkemail_Step_Startusing2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Začít používat MetaCleaner`)
};

/**
* | output |
* | --- |
* | "Start using MetaCleaner" |
*
* @param {Auth_Checkemail_Step_Startusing2Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_checkemail_step_startusing2 = /** @type {((inputs?: Auth_Checkemail_Step_Startusing2Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Checkemail_Step_Startusing2Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_checkemail_step_startusing2(inputs)
	return cs_auth_checkemail_step_startusing2(inputs)
});
export { auth_checkemail_step_startusing2 as "auth.checkEmail.step.startUsing" }