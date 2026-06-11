/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Benefit_CancelInputs */

const en_auth_register_benefit_cancel = /** @type {(inputs: Auth_Register_Benefit_CancelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cancel anytime, no obligations`)
};

const cs_auth_register_benefit_cancel = /** @type {(inputs: Auth_Register_Benefit_CancelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Kdykoli zrušte bez závazků`)
};

/**
* | output |
* | --- |
* | "Cancel anytime, no obligations" |
*
* @param {Auth_Register_Benefit_CancelInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_benefit_cancel = /** @type {((inputs?: Auth_Register_Benefit_CancelInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Benefit_CancelInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_benefit_cancel(inputs)
	return cs_auth_register_benefit_cancel(inputs)
});
export { auth_register_benefit_cancel as "auth.register.benefit.cancel" }