/*
 * (c) Copyright Ascensio System SIA 2010-2024
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

define([], function () { 'use strict';

    Common.Views.DocumentPropertyDialog = Common.UI.Window.extend(_.extend({
        options: {
            width: 320,
            cls: 'modal-dlg',
            buttons: ['ok', 'cancel']
        },

        initialize : function(options) {
            _.extend(this.options, {
                title: this.txtTitle,
                defaultValue: {}
            }, options);

            this.template = [
                '<div class="document-info-content">',
                    '<div>',
                        '<label>' + this.txtPropertyTitleLabel + '</label>',
                        '<div id="id-dlg-title"></div>',
                    '</div>',
                    '<div>',
                        '<label>' + this.txtPropertyTypeLabel + '</label>',
                        '<div id="id-dlg-type"></div>',
                    '</div>',
                    '<div>',
                        '<label>' + this.txtPropertyValueLabel + '</label>',
                        '<div id="id-dlg-value-input"></div>',
                        '<div id="id-dlg-value-date"></div>',
                        '<div id="id-dlg-value-boolean"></div>',
                    '</div>',
                '</div>'
            ].join('');

            this.options.tpl = _.template(this.template)(this.options);

            this.asc2type = function(ascType) {
                if (ascType === AscCommon.c_oVariantTypes.vtLpwstr) {
                    return 'text';
                } else if (ascType === AscCommon.c_oVariantTypes.vtI4 || ascType === AscCommon.c_oVariantTypes.vtR8) {
                    return 'number';
                } else if (ascType === AscCommon.c_oVariantTypes.vtBool) {
                    return 'boolean';
                } else if (ascType === AscCommon.c_oVariantTypes.vtFiletime) {
                    return 'date';
                }
            }

            Common.UI.Window.prototype.initialize.call(this, this.options);
        },

        render: function() {
            Common.UI.Window.prototype.render.call(this);

            this.inputTitle = new Common.UI.InputField({
                el: $('#id-dlg-title'),
                allowBlank: false,
                validateOnBlur: false,
                validation: function(value) {
                    return value.length === 0 ? this.txtPropertyTitleBlankError : true;
                }
            });
            if (this.options.defaultValue.name) {
                this.inputTitle.setValue(this.options.defaultValue.name);
            }

            this.comboboxType = new Common.UI.ComboBox({
                el: $('#id-dlg-type'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 85px;',
                editable: false,
                data: [
                    { displayValue: this.txtPropertyTypeText, value: 'text' },
                    { displayValue: this.txtPropertyTypeNumber, value: 'number' },
                    { displayValue: this.txtPropertyTypeDate, value: 'date' },
                    { displayValue: this.txtPropertyTypeBoolean, value: 'boolean' }
                ],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.strLineHeight
            });
            var currentType = this.options.defaultValue.type ? this.asc2type(this.options.defaultValue.type) : 'text'
            this.comboboxType.setValue(currentType);
            this.comboboxType.on('selected', _.bind(function (cmb, record) {
                this.inputTextOrNumber.setVisible(record.value === 'text' || record.value === 'number');
                this.comboboxBoolean.setVisible(record.value === 'boolean');
                this.datepicker.setVisible(record.value === 'date');
            }, this))

            this.inputTextOrNumber = new Common.UI.InputField({
                el: $('#id-dlg-value-input'),
                style: 'width: 100%;',
                validateOnBlur: false,
                validation: function(value) {
                    if (value.length === 0) {
                        return this.txtPropertyValueBlankError;
                    }

                    if (this.comboboxType.getValue() === 'number' && isNaN(value.replace(',', '.'))) {
                        return this.txtPropertyTypeNumberInvalid;
                    }

                    return true;
                }.bind(this)
            });
            if (this.options.defaultValue.value && (currentType === 'text' || currentType === 'number')) {
                this.inputTextOrNumber.setValue(this.options.defaultValue.value);
            }
            this.inputTextOrNumber.setVisible(
                this.options.defaultValue.type
                    ? (this.options.defaultValue.type !== AscCommon.c_oVariantTypes.vtFiletime && this.options.defaultValue.type !== AscCommon.c_oVariantTypes.vtBool)
                    : (currentType === 'text' || currentType === 'number')
            );

            this.comboboxBoolean = new Common.UI.ComboBox({
                el: $('#id-dlg-value-boolean'),
                cls: 'input-group-nr',
                menuStyle: 'min-width: 85px;',
                editable: false,
                data: [
                    { displayValue: this.txtPropertyBooleanTrue, value: 1 },
                    { displayValue: this.txtPropertyBooleanFalse, value: 0 }
                ],
                dataHint: '1',
                dataHintDirection: 'bottom',
                dataHintOffset: 'big',
                ariaLabel: this.strLineHeight
            });
            this.comboboxBoolean.setValue(this.options.defaultValue.value !== undefined && currentType === 'boolean' ? (this.options.defaultValue.value ? 1 : 0) : 1);
            this.comboboxBoolean.setVisible(this.options.defaultValue.type ? this.options.defaultValue.type === AscCommon.c_oVariantTypes.vtBool : currentType === 'boolean');

            this.datepicker = new Common.UI.InputFieldBtnCalendar({
                el: $('#id-dlg-value-date'),
                allowBlank  : true,
                validateOnChange: false,
                validateOnBlur: false,
                value       : '',
                dataHint    : '1',
                dataHintDirection: 'left',
                dataHintOffset: 'small'
            });
            if (this.options.defaultValue.value && currentType === 'date') {
                this.datepicker.setValue(this.options.defaultValue.value);
            }
            this.datepicker.setVisible(this.options.defaultValue.type ? this.options.defaultValue.type === AscCommon.c_oVariantTypes.vtFiletime : currentType === 'date');
            this.datepicker.on('date:click', function (_, date) {
                this.datepicker.setValue(date);
            }.bind(this));

            var $window = this.getChild();
            $window.find('.dlg-btn').on('click', _.bind(this.onBtnClick, this));
        },

        getFocusedComponents: function() {
            return [this.inputUrl].concat(this.getFooterButtons());
        },

        getDefaultFocusableComponent: function () {
            return this.inputUrl;
        },

        show: function() {
            Common.UI.Window.prototype.show.apply(this, arguments);

            var me = this;
            _.delay(function(){
                me.getChild('input').focus();
            },100);
        },

        onPrimary: function(event) {
            this._handleInput('ok');
            return false;
        },

        onBtnClick: function(event) {
            this._handleInput(event.currentTarget.attributes['result'].value);
        },

        _handleInput: function(state) {
            if (this.options.handler) {
                if (state === 'ok') {
                    if (this.inputTitle.checkValidate() !== true)  {
                        this.inputTitle.cmpEl.find('input').focus();
                        return;
                    }

                    var title = this.inputTitle.getValue(), type = this.comboboxType.getValue(), ascValue, ascType;
                    if (type === 'boolean') {
                        ascValue = this.comboboxBoolean.getValue() === 1;
                        ascType = AscCommon.c_oVariantTypes.vtBool;
                    } else if (type === 'date') {
                        if (this.datepicker.checkValidate() !== true)  {
                            this.datepicker.cmpEl.find('input').focus();
                            return;
                        }

                        ascValue = this.datepicker.getValue();
                        ascType = AscCommon.c_oVariantTypes.vtFiletime;
                    } else {
                        if (this.inputTextOrNumber.checkValidate() !== true)  {
                            this.inputTextOrNumber.cmpEl.find('input').focus();
                            return;
                        }

                        var value = this.inputTextOrNumber.getValue();
                        if (type === 'text') {
                            ascType = AscCommon.c_oVariantTypes.vtLpwstr;
                            ascValue = value;
                        } else {
                            // note: precisely a numeric value because we validated it
                            value = value.replace(',', '.');
                            if (value % 1 === 0) {
                                ascType = AscCommon.c_oVariantTypes.vtI4;
                                ascValue = parseInt(value);
                            } else {
                                ascType = AscCommon.c_oVariantTypes.vtR8;
                                ascValue = parseFloat(value);
                            }
                        }
                    }

                    this.options.handler.call(this, state, title, ascType, ascValue);
                }
            }

            this.close();
        },

        txtTitle: "New Document Property",
        txtPropertyTitleLabel: "Title",
        txtPropertyTitleBlankError: 'Property should have a title',
        txtPropertyTypeLabel: "Type",
        txtPropertyValueLabel: "Value",
        txtPropertyValueBlankError: 'Property should have a value',
        txtPropertyTypeText: "Text",
        txtPropertyTypeNumber: "Number",
        txtPropertyTypeNumberInvalid: 'Provide a valid number',
        txtPropertyTypeDate: "Date",
        txtPropertyTypeBoolean: '"Yes" or "no"',
        txtPropertyBooleanTrue: 'Yes',
        txtPropertyBooleanFalse: 'No'
    }, Common.Views.DocumentPropertyDialog || {}));
});