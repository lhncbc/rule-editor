import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Question } from '../variable';
import { VariableService } from '../variable.service';
import { Unit, UNIT_CONVERSION } from '../units';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html'
})
export class QuestionComponent implements OnInit {
  @Input() variable;
  @Input() advancedInterface;
  linkId = '';
  questions: Question[];
  isScore = false;
  isNonConvertibleUnit = false;
  toUnit: string;
  unit: string;
  conversionOptions: Unit[];

  constructor(private variableService: VariableService) {}

  /**
   * Angular lifecycle hook called when the component is initialized
   */
  ngOnInit(): void {
    this.linkId = this.variable.linkId ? this.variable.linkId : '';
    this.toUnit = this.variable.unit ? this.variable.unit : '';
    this.questions = this.variableService.questions;

    this.onChange(false);

    this.variableService.questionsChange.subscribe((questions) => {
      this.questions = questions;
    });
  }

  /**
   * Get the question based on linkId
   * @param linkId - FHIR linkId
   */
  getQuestion(linkId): Question {
    return this.questions.find((q) => {
      return q.linkId === linkId;
    });
  }

  /**
   * Get the list of units we can convert to based on the starting unit
   * @param unit - Starting unit
   */
  getConversionOptions(unit: string): Unit[] {
    return UNIT_CONVERSION[unit];
  }

  /**
   * Called when the questionnaire question or unit is changed
   * @param isQuestion - The change was for a question
   */
  onChange(isQuestion): void {
    if (isQuestion) {
      // Reset the conversion options when the question changes
      this.toUnit = '';
    }

    // If we already have a question selected (as opposed to the select... prompt)
    if (this.linkId) {
      const question = this.getQuestion(this.linkId);
      this.unit = question?.unit;
      this.conversionOptions = this.getConversionOptions(this.unit);
      this.isNonConvertibleUnit = this.unit && !this.conversionOptions;

      // Check if this is a score
      if (!this.conversionOptions && !this.isNonConvertibleUnit) {
        this.isScore = this.variableService.itemHasScore(this.linkId);
      } else {
        this.isScore = false;
      }

      this.variable.expression = this.variableService.calculateExpression(
        this.linkId, this.isScore, !this.isNonConvertibleUnit, this.unit, this.toUnit);
    }
  }
}
