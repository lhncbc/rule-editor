import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';

import { RuleEditorService, SimpleStyle } from './rule-editor.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'lhc-rule-editor',
  templateUrl: 'rule-editor.component.html',
  styleUrls: ['rule-editor.component.css']
})
export class RuleEditorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() advancedInterface = false;
  @Input() doNotAskToCalculateScore = false;
  @Input() fhirQuestionnaire = null;
  @Input() itemLinkId = null;
  @Input() submitButtonName = 'Submit';
  @Input() titleName = 'Rule Editor';
  @Input() userExpressionChoices = null;
  @Input() expressionLabel = 'Final Expression';
  @Input() expressionUri = '';
  @Input() lhcStyle: SimpleStyle = {};
  @Output() save = new EventEmitter<object>();
  @Output() cancel = new EventEmitter();

  errorLoading = 'Could not detect a FHIR Questionnaire; please try a different file.';
  expressionSyntax: string;
  simpleExpression: string;
  finalExpression: string;
  finalExpressionExtension;
  linkIdContext: string;
  calculateSum: boolean;
  variables: string[];
  uneditableVariables: string[];
  caseStatements: boolean;
  disableInterfaceToggle = false;
  loadError = false;
  showCancelConfirmationDialog = false;
  selectItems: boolean;
  hideRuleEditor = false;
  validationError = false;
  validationErrorMessage;

  previousExpressionSyntax;
  previousFinalExpression;
  showConfirmDialog = false;

  dialogTitle = "Converting FHIRPath Expression to Easy Path Expression";
  dialogPrompt1 = "The Rule Editor does not support conversion from FHIRPath Expression " +
                  "to Easy Path Expression. Switching to the Easy Path Expression for the " +
                  "output expression would result in the expression becoming blank.";
  dialogPrompt2 = "Proceed?";

  private calculateSumSubscription;
  private finalExpressionSubscription;
  private variablesSubscription;
  private uneditableVariablesSubscription;
  private disableAdvancedSubscription;
  private validationSubscription;

  constructor(private variableService: RuleEditorService, private liveAnnouncer: LiveAnnouncer, private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.calculateSumSubscription = this.variableService.scoreCalculationChange.subscribe((scoreCalculation) => {
      this.calculateSum = (scoreCalculation && !this.doNotAskToCalculateScore);
    });
    this.finalExpressionSubscription = this.variableService.finalExpressionChange.subscribe((finalExpression) => {
      this.finalExpression = finalExpression;
    });
    this.variablesSubscription = this.variableService.variablesChange.subscribe((variables) => {
      this.variables = this.variableService.getVariableNames();
    });
    this.uneditableVariablesSubscription = this.variableService.uneditableVariablesChange.subscribe((variables) => {
      this.variables = this.variableService.getVariableNames();
    });
    this.disableAdvancedSubscription = this.variableService.disableAdvancedChange.subscribe((disable) => {
      this.disableInterfaceToggle = disable;
    });
    this.validationSubscription = this.variableService.validationChange.subscribe((validation) => {
      if (validation) {
        this.validationError = true;
        const errorMessage = "Save button. The 'Save' button is disabled due to the validation error";
        if (validation['section'] === "Item Variables") {
          if (validation['variableName'])
            this.validationErrorMessage = errorMessage + " for the variable '" + validation['name'] +
                                          "' found in the " + validation['section'] + " section.";
          else
            this.validationErrorMessage = errorMessage + " found in the " + validation['section'] +
                                          " section.";
        } else
          this.validationErrorMessage = errorMessage + " for the " + validation['name'] +
                                        " found in the " + validation['section'] + " section.";
      } else {
        this.validationError = false;
        this.validationErrorMessage = "";
      }
    });
  }

  /**
   * Angular lifecycle hook called before the component is destroyed
   */
  ngOnDestroy(): void {
    this.calculateSumSubscription.unsubscribe();
    this.finalExpressionSubscription.unsubscribe();
    this.variablesSubscription.unsubscribe();
    this.uneditableVariablesSubscription.unsubscribe();
    this.disableAdvancedSubscription.unsubscribe();

    this.validationSubscription.unsubscribe();
  }

  /**
   * There are scenarios when switching the questionnaire; some components may
   * not get updated or displayed properly as Angular is not detecting changes.
   * This function attempts to reset those variables so that the components will
   * get updated correctly.
   * @private
   */
  private resetVariablesOnQuestionnaireChange(): void {
    this.expressionSyntax = null;
    this.simpleExpression = null;
    this.finalExpression = null;
    this.linkIdContext = null;
    this.calculateSum = false;
    this.variables = [];
    this.uneditableVariables = [];
    this.caseStatements = false;

    this.changeDetectorRef.detectChanges();
  }

  /**
   * Angular lifecycle hook called on input changes
   */
  ngOnChanges(): void {
    this.calculateSum = false;
    this.selectItems = false;
    this.hideRuleEditor = false;
    this.doNotAskToCalculateScore = false;
    this.resetVariablesOnQuestionnaireChange();
    this.reload();

  }

  /**
   * Re-import fhir and context and show the form
   */
  reload(): void {
    if (this.fhirQuestionnaire instanceof Object) {
      this.variableService.doNotAskToCalculateScore = this.doNotAskToCalculateScore;
      this.loadError = !this.variableService.import(this.expressionUri, this.fhirQuestionnaire, this.itemLinkId);
      if (this.loadError) {
        this.liveAnnouncer.announce(this.errorLoading);
      }
      this.disableInterfaceToggle = this.variableService.needsAdvancedInterface;
      this.advancedInterface = this.variableService.needsAdvancedInterface;
    }

    this.caseStatements = this.variableService.caseStatements;
    this.simpleExpression = this.variableService.simpleExpression;
    this.linkIdContext = this.variableService.linkIdContext;
    this.expressionSyntax = this.variableService.syntaxType;
    this.selectItems = false;

    if (this.linkIdContext) {
      this.doNotAskToCalculateScore = !this.variableService.shouldCalculateScoreForItem(this.fhirQuestionnaire, this.linkIdContext, this.expressionUri);
    } else {
      this.doNotAskToCalculateScore = true;
    }

    this.calculateSum = (this.variableService.scoreCalculation && !this.doNotAskToCalculateScore);
    this.finalExpressionExtension = this.variableService.finalExpressionExtension;
    this.finalExpression = this.variableService.finalExpression;
    this.variables = this.variableService.getVariableNames();
  }

  /**
   * Export FHIR Questionnaire and download as a file
   */
  export(): void {
    if (!this.validationError) {
      const finalExpression = this.finalExpressionExtension;
      if (finalExpression?.valueExpression)
        finalExpression.valueExpression.expression = this.finalExpression;
      this.save.emit(this.variableService.export(this.expressionUri, finalExpression));
    }
  }

  /**
   * Create a new instance of a FHIR questionnaire file by summing all ordinal
   * values
   */
  selectItemsForSumOfScores(): void {
    this.selectItems = true;
  }

  /**
   * Cancelling changes to the Rule Editor
   * 
   */
  cancelRuleEditorChanges(): void {
    this.showCancelConfirmationDialog = true;
  }

  /**
   * Confirm to cancel change
   */
  confirmCancel(): void {
    this.liveAnnouncer.announce("'yes' was selected. Changes were canceled.");

    setTimeout(() => {
      this.cancel.emit();
      this.showCancelConfirmationDialog = false;
    }, 500);
  }

  /**
   * Discard the cancel request
   */
  discardCancel(): void {
    this.liveAnnouncer.announce("'no' was selected. Changes were not canceled");

    setTimeout(() => {
      this.showCancelConfirmationDialog = false;
    }, 100);
  }

  /**
   * Create a new instance of a FHIR questionnaire file by summing all ordinal
   * values
   */
  addSumOfScores(): void {
    this.calculateSum = false;
    this.selectItems = false;
    this.hideRuleEditor = true;

    this.variableService.removeSumOfScores(this.fhirQuestionnaire, this.linkIdContext);
    this.save.emit(this.variableService.addSumOfScores());

    this.reload();
  }

  /**
   * Update the final expression
   */
  updateFinalExpression(expression): void {
    this.finalExpression = expression;
  }

  /**
   * Update the simple final expression
   */
  updateSimpleExpression(simple): void {
    this.simpleExpression = simple;
  }

  /**
   * Toggle the advanced interface based on the type
   */
  onTypeChange(event): void {
    if (this.expressionSyntax === 'fhirpath' && event.target.value === 'simple') {
      if (this.finalExpression !== '' && this.finalExpression !== this.previousFinalExpression) {
        this.previousExpressionSyntax = this.expressionSyntax;

        if (this.caseStatements)
          this.dialogPrompt1 = "The Rule Editor does not support conversion from FHIRPath Expression " +
          "to Easy Path Expression. Switching to Easy Path Expression for the case statement " +
          "would result in the expression becoming blank.";
        this.showConfirmDialog = true;
      } else {
        this.previousExpressionSyntax = event.target.value;
        this.expressionSyntax = event.target.value;
      }
      return;
    } else {
      this.expressionSyntax = event.target.value;
    }
    this.previousFinalExpression = this.finalExpression;

    if (event.target.value === 'fhirpath') {
      this.variableService.seeIfAdvancedInterfaceIsNeeded(true);
    } else {
      // Need to check all other variables and the final expression before we
      // allow the advanced interface to be removed
      this.variableService.seeIfAdvancedInterfaceIsNeeded();
    }

    if (this.variableService.needsAdvancedInterface) {
      this.advancedInterface = true;
      this.disableInterfaceToggle = true;
    } else {
      this.disableInterfaceToggle = false;
    }
  }

  /**
   * Proceed with changing from FHIRPath Expression to Easy Path Expression
   */
  convertFHIRPathToEasyPath(): void {
    if (this.previousFinalExpression &&
        this.previousFinalExpression !== this.finalExpression && 
        this.simpleExpression && 
        this.simpleExpression !== '') {
      this.simpleExpression = '';
    }
    this.showConfirmDialog = false;
    this.expressionSyntax = 'simple';

    this.variableService.seeIfAdvancedInterfaceIsNeeded();
  }

  /**
   * Cancel changing from FHIRPath Expression to Easy Path Expression
   */
  closeConvertDialog(): void {
    this.expressionSyntax = '';
    this.showConfirmDialog = false;

    setTimeout(() => {
      this.expressionSyntax = 'fhirpath';
    }, 10);
  }
}
