/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Step2_Risk_Deviceidentity1Inputs */

const en_step2_risk_deviceidentity1 = /** @type {(inputs: Step2_Risk_Deviceidentity1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Device identity`)
};

const cs_step2_risk_deviceidentity1 = /** @type {(inputs: Step2_Risk_Deviceidentity1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Identita zařízení`)
};

/**
* | output |
* | --- |
* | "Device identity" |
*
* @param {Step2_Risk_Deviceidentity1Inputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const step2_risk_deviceidentity1 = /** @type {((inputs?: Step2_Risk_Deviceidentity1Inputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Step2_Risk_Deviceidentity1Inputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_step2_risk_deviceidentity1(inputs)
	return cs_step2_risk_deviceidentity1(inputs)
});
export { step2_risk_deviceidentity1 as "step2.risk.deviceIdentity" }