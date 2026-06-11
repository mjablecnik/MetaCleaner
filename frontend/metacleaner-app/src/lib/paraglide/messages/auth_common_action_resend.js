/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Common_Action_ResendInputs */

const en_auth_common_action_resend = /** @type {(inputs: Auth_Common_Action_ResendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resend`)
};

const cs_auth_common_action_resend = /** @type {(inputs: Auth_Common_Action_ResendInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Odeslat znovu`)
};

/**
* | output |
* | --- |
* | "Resend" |
*
* @param {Auth_Common_Action_ResendInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const auth_common_action_resend = /** @type {((inputs?: Auth_Common_Action_ResendInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Common_Action_ResendInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_common_action_resend(inputs)
	return cs_auth_common_action_resend(inputs)
});
export { auth_common_action_resend as "auth.common.action.resend" }