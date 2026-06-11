/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Report_Chart_FieldsInputs */

const en_report_chart_fields = /** @type {(inputs: Report_Chart_FieldsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`fields`)
};

const cs_report_chart_fields = /** @type {(inputs: Report_Chart_FieldsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`polí`)
};

/**
* | output |
* | --- |
* | "fields" |
*
* @param {Report_Chart_FieldsInputs} inputs
* @param {{ locale?: "en" | "cs" }} options
* @returns {LocalizedString}
*/
const report_chart_fields = /** @type {((inputs?: Report_Chart_FieldsInputs, options?: { locale?: "en" | "cs" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Report_Chart_FieldsInputs, { locale?: "en" | "cs" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_report_chart_fields(inputs)
	return cs_report_chart_fields(inputs)
});
export { report_chart_fields as "report.chart.fields" }