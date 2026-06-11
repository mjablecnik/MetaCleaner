/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Register_Benefit_E2eInputs */

const en_auth_register_benefit_e2e = /** @type {(inputs: Auth_Register_Benefit_E2eInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Secure E2E encryption`)
};

const cs_auth_register_benefit_e2e = /** @type {(inputs: Auth_Register_Benefit_E2eInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Zabezpečené E2E šifrování`)
};

/**
* | output |
* | --- |
* | "Secure E2E encryption" |
*
* @param {Auth_Register_Benefit_E2eInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_register_benefit_e2e = /** @type {((inputs?: Auth_Register_Benefit_E2eInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Register_Benefit_E2eInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_register_benefit_e2e(inputs)
	return cs_auth_register_benefit_e2e(inputs)
});
export { auth_register_benefit_e2e as "auth.register.benefit.e2e" }