import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { A11yModule } from '@angular/cdk/a11y';
import { TreeModule } from '@bugsplat/angular-tree-component';

import { RuleEditorComponent } from './rule-editor.component';
import { VariablesComponent } from './variables/variables.component';
import { UneditableVariablesComponent } from './uneditable-variables/uneditable-variables.component';
import { QuestionComponent } from './question/question.component';
import { CalculateSumPromptComponent } from './calculate-sum-prompt/calculate-sum-prompt.component';
import { EasyPathExpressionsPipe } from './easy-path-expressions.pipe';
import { SyntaxConverterComponent } from './syntax-converter/syntax-converter.component';
import { SyntaxPreviewComponent } from './syntax-preview/syntax-preview.component';
import { QueryObservationComponent } from './query-observation/query-observation.component';
import { CaseStatementsComponent } from './case-statements/case-statements.component';
import { SelectScoringItemsComponent } from './select-scoring-items/select-scoring-items.component';

@NgModule({
  declarations: [
    RuleEditorComponent,
    VariablesComponent,
    UneditableVariablesComponent,
    QuestionComponent,
    CalculateSumPromptComponent,
    EasyPathExpressionsPipe,
    SyntaxConverterComponent,
    SyntaxPreviewComponent,
    QueryObservationComponent,
    CaseStatementsComponent,
    SelectScoringItemsComponent
  ],
  imports: [
    FormsModule,
    BrowserAnimationsModule,
    DragDropModule,
    MatRadioModule,
    ClipboardModule,
    MatTooltipModule,
    MatSnackBarModule,
    TreeModule
  ],
  exports: [
    RuleEditorComponent
  ]
})
export class RuleEditorModule {
}
