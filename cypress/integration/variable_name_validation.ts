import * as constants from "../../projects/ng-rule-editor/src/lib/validation";

describe('Rule editor', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  describe('Angular Library', () => {
    describe('BMI calculation', () => {

      it('should enable the "Save" button if there are no errors', () => {
        cy.get('select#questionnaire-select').select('BMI Calculation (Easy Path expression)');

        // Click the button to edit the expression
        cy.get('button#openRuleEditor').should('exist').click();
        // The Rule Editor dialog should now appear
        cy.get('#rule-editor-dialog').should('exist');

        cy.get('#variables-section .variable-row').should('have.length', 2);

        // Add a variable
        cy.get('#add-variable').click();
        cy.get('#variables-section .variable-row').should('have.length', 3);

        // The 'Save' button should be enabled.
        cy.get('#export').should('not.have.class', 'disabled');

        cy.get('div#row-2')
          .within(() => {
            cy.get('#variable-label-2').should('not.have.class', 'field-error');
            cy.get('#variable-label-2').clear().type('aaa');
            cy.get('#variable-label-2').should('not.have.class', 'field-error');
          });

        // The 'Save' button should still be enabled.
        cy.get('#export').should('not.have.class', 'disabled');

        // Click Save
        cy.get('#export').click();

        // Export output should not be empty
        cy.get('pre#output').should('exist').should('not.be.empty');
      });

      it('should disable the "Save" button if there is a validation error', () => {
        cy.get('select#questionnaire-select').select('BMI Calculation (Easy Path expression)');

        // Click the button to edit the expression
        cy.get('button#openRuleEditor').should('exist').click();
        // The Rule Editor dialog should now appear
        cy.get('#rule-editor-dialog').should('exist');

        cy.get('#variables-section .variable-row').should('have.length', 2);

        // Add a variable
        cy.get('#add-variable').click();
        cy.get('#variables-section .variable-row').should('have.length', 3);

        // The 'Save' button should be enabled.
        cy.get('#export').should('not.have.class', 'disabled');

        cy.get('div#row-2')
          .within(() => {
            cy.get('#variable-label-2').should('not.have.class', 'field-error');
            cy.get('#variable-label-2').clear();
            cy.get('#variable-label-2').should('have.class', 'field-error');
          });

        // The 'Save' button should be disabled.
        cy.get('#export').should('have.class', 'disabled');

        // Click Save, nothing should happen
        cy.get('#export').click();

        // The Rule Editor dialog should stay visible.
        cy.get('#rule-editor-dialog').should('exist');

      });

      it('should display error if name is blank', () => {
        cy.get('select#questionnaire-select').select('BMI Calculation (Easy Path expression)');

        // Click the button to edit the expression
        cy.get('button#openRuleEditor').should('exist').click();
        // The Rule Editor dialog should now appear
        cy.get('#rule-editor-dialog').should('exist');

        cy.get('#variables-section .variable-row').should('have.length', 2);

        // Add a variable
        cy.get('#add-variable').click();
        cy.get('#variables-section .variable-row').should('have.length', 3);

        cy.get('div#row-2')
          .within(() => {
            cy.get('#variable-label-2').should('not.have.class', 'field-error');
            cy.get('#variable-label-2').clear();
            cy.get('#variable-label-2').should('have.class', 'field-error');
            cy.get('div#variable-name-error > p').should('contain.text', constants.VARIABLE_NAME_REQUIRED);
          });
      });

      it('should display error if the entered variable name already exists in the same scope', () => {
        cy.get('select#questionnaire-select').select('BMI Calculation (Easy Path expression)');

        // Click the button to edit the expression
        cy.get('button#openRuleEditor').should('exist').click();
        // The Rule Editor dialog should now appear
        cy.get('#rule-editor-dialog').should('exist');

        cy.get('#variables-section .variable-row').should('have.length', 2);

        // Add a variable
        cy.get('#add-variable').click();
        cy.get('#variables-section .variable-row').should('have.length', 3);

        cy.get('div#row-2')
          .within(() => {
            cy.get('#variable-label-2').should('not.have.class', 'field-error');
            cy.get('#variable-label-2').clear().type('a');
            cy.get('#variable-label-2').should('have.class', 'field-error');

            cy.get('div#variable-name-error > p')
              .should('contain.text', constants.VARIABLE_NAME_EXISTS);
          });
      });

      /**
       * FHIRPath supplements
       * Reference: http://hl7.org/fhir/R4/fhirpath.html#vars
       * 
       * The FHIRPath language defines a set of contexts that get passed into expressions
       * and also allows the definition of additional contexts and functions. SDC provides
       * the following supplemental guidance for evaluating FHIRPath, and CQL and FHIR
       * Queries in the context of a Questionnaire:
       *
       * The %resource variable when it appears in expressions on elements in Questionnaire
       * will be evaluated as the root of the QuestionnaireResponse.
       * 
       * The %context variable will be set to the QuestionnaireResponse if the expression
       * extension is defined on the Questionnaire root. Otherwise, it will be interpreted
       * as the QuestionnaireResponse.item(s) whose linkId matches the linkId of the
       * Questionnaire.item the expression extension was defined in. I.e. while the
       * extensions and expressions are defined in the Questionnaire, they are evaluated in
       * the context of the corresponding item(s) in the QuestionnaireResponse.
       * 
       * All expressions that specify a 'name' can be accessed by other expressions appearing
       * on the same item or any descendant item as though that name was part of context. The
       * same is true for the 'name' element in the launchContext extension. For example, a
       * variable with the name 'score' could be accessed in FHIRPath or CQL using %score.
       * (Note: It is an error if a questionnaire is designed such that there is more than one
       * element in the same scope with a colliding context name.)
       * 
       * In addition, a number of extensions have been proposed to the FHIRPath language - some
       * to the base language and some to the FHIR-specific set of extensions to the language.
       * These extensions have been adopted as 'local' FHIRPath extensions for implementers of
       * this implementation guide. Systems that accept FHIRPath, CQL or FHIRQuery expressions
       * SHOULD support all of these extensions in their FHIRPath implementations:
       * 
       * A new %questionnaire variable is defined that corresponds to the Questionnaire resource
       * resolved to by the QuestionnaireResponse.questionnaire element. It is in scope for all
       * expressions defined in the Questionnaire.
       * 
       * The %qitem variable is defined as a shortcut to get to the Questionnaire.item that
       * corresponds to the context QuestionnaireResponse.item. It is only valid for FHIRPath
       * expressions defined within a Questionnaire item.
       */
      it('should display error if the entered variable name matches with the FHIRPath Context name', () => {
        cy.get('select#questionnaire-select').select('BMI Calculation (Easy Path expression)');

        // Click the button to edit the expression
        cy.get('button#openRuleEditor').should('exist').click();
        // The Rule Editor dialog should now appear
        cy.get('#rule-editor-dialog').should('exist');

        cy.get('#variables-section .variable-row').should('have.length', 2);

        // Add a variable
        cy.get('#add-variable').click();
        cy.get('#variables-section .variable-row').should('have.length', 3);

        cy.get('div#row-2')
          .within(() => {
            cy.get('#variable-label-2').should('not.have.class', 'field-error');
            // type variable name 'resource'
            cy.get('#variable-label-2').clear().type('resource');
            cy.get('#variable-label-2').should('have.class', 'field-error');
            cy.get('div#variable-name-error > p')
              .should('contain.text', constants.VARIABLE_NAME_MATCHES_FHIRPATH_CONTEXT);

            // reset variable name back to 'c'
            cy.get('#variable-label-2').clear().type('c');
            cy.get('#variable-label-2').should('not.have.class', 'field-error');
            cy.get('div#variable-name-error > p').should('not.exist');

            // type variable name 'context'
            cy.get('#variable-label-2').clear().type('context');
            cy.get('#variable-label-2').should('have.class', 'field-error');
            cy.get('div#variable-name-error > p')
              .should('contain.text', constants.VARIABLE_NAME_MATCHES_FHIRPATH_CONTEXT);

            // change variable name back to 'c'
            cy.get('#variable-label-2').clear().type('c');
            cy.get('#variable-label-2').should('not.have.class', 'field-error');
            cy.get('div#variable-name-error > p').should('not.exist');

            // type variable name 'score'
            cy.get('#variable-label-2').clear().type('score');
            cy.get('#variable-label-2').should('have.class', 'field-error');
            cy.get('div#variable-name-error > p')
              .should('contain.text', constants.VARIABLE_NAME_MATCHES_FHIRPATH_CONTEXT);

            // reset variable name back to 'c'
            cy.get('#variable-label-2').clear().type('c');
            cy.get('#variable-label-2').should('not.have.class', 'field-error');
            cy.get('div#variable-name-error > p').should('not.exist');
            
            // type variable name 'questionnaire'
            cy.get('#variable-label-2').clear().type('questionnaire');
            cy.get('#variable-label-2').should('have.class', 'field-error');
            cy.get('div#variable-name-error > p')
              .should('contain.text', constants.VARIABLE_NAME_MATCHES_FHIRPATH_CONTEXT);

            // reset variable name back to 'c'
            cy.get('#variable-label-2').clear().type('c');
            cy.get('#variable-label-2').should('not.have.class', 'field-error');
            cy.get('div#variable-name-error > p').should('not.exist');

            // type variable name 'qitem'
            cy.get('#variable-label-2').clear().type('qitem');
            cy.get('#variable-label-2').should('have.class', 'field-error');
            cy.get('div#variable-name-error > p')
              .should('contain.text', constants.VARIABLE_NAME_MATCHES_FHIRPATH_CONTEXT);

            // reset variable name back to 'c'
            cy.get('#variable-label-2').clear().type('c');
            cy.get('#variable-label-2').should('not.have.class', 'field-error');
            cy.get('div#variable-name-error > p').should('not.exist');
          });
      });

      /**
       * Environment Variables
       * Reference: http://hl7.org/fhir/R4/fhirpath.html#vars
       * 
       * %sct - (string) url for snomed ct
       * %loinc - (string) url for loinc
       * %"vs-[name]" - (string) full url for the provided HL7 value set with id [name]
       * %"ext-[name]" - (string) full url for the provided HL7 extension with id [name]
       * %resource - The original resource current context is part of. When evaluating a
       *             datatype, this would be the resource the element is part of. Do not
       *             go past a root resource into a bundle, if it is contained in a bundle.
       */
      it('should display error if the entered variable name matches with the Environment variable name', () => {
        cy.get('select#questionnaire-select').select('BMI Calculation (Easy Path expression)');

        // Click the button to edit the expression
        cy.get('button#openRuleEditor').should('exist').click();
        // The Rule Editor dialog should now appear
        cy.get('#rule-editor-dialog').should('exist');

        cy.get('#variables-section .variable-row').should('have.length', 2);

        // Add a variable
        cy.get('#add-variable').click();
        cy.get('#variables-section .variable-row').should('have.length', 3);

        cy.get('div#row-2')
          .within(() => {
            cy.get('#variable-label-2').should('not.have.class', 'field-error');
            // type variable name 'sct'
            cy.get('#variable-label-2').clear().type('sct');
            cy.get('#variable-label-2').should('have.class', 'field-error');
            cy.get('div#variable-name-error > p')
              .should('contain.text', constants.VARIABLE_NAME_MATCHES_ENVIRONMENT_VARIABLES);

            // reset variable name back to 'c'
            cy.get('#variable-label-2').clear().type('c');
            cy.get('#variable-label-2').should('not.have.class', 'field-error');
            cy.get('div#variable-name-error > p').should('not.exist');

            // type variable name 'loinc'
            cy.get('#variable-label-2').clear().type('loinc');
            cy.get('#variable-label-2').should('have.class', 'field-error');
            cy.get('div#variable-name-error > p')
              .should('contain.text', constants.VARIABLE_NAME_MATCHES_ENVIRONMENT_VARIABLES);

            // reset variable name back to 'c'
            cy.get('#variable-label-2').clear().type('c');
            cy.get('#variable-label-2').should('not.have.class', 'field-error');
            cy.get('div#variable-name-error > p').should('not.exist');

            // type variable name 'vs-'
            cy.get('#variable-label-2').clear().type('vs-');
            cy.get('#variable-label-2').should('not.have.class', 'field-error');
            cy.get('div#variable-name-error > p').should('not.exist');

            // type variable name 'vs-*'
            cy.get('#variable-label-2').clear().type('vs-a');
            cy.get('#variable-label-2').should('have.class', 'field-error');
            cy.get('div#variable-name-error > p')
              .should('contain.text', constants.VARIABLE_NAME_MATCHES_ENVIRONMENT_VARIABLES);

            // type variable name 'vs-*-*'
            cy.get('#variable-label-2').clear().type('vs-a-2');
            cy.get('#variable-label-2').should('have.class', 'field-error');
            cy.get('div#variable-name-error > p')
              .should('contain.text', constants.VARIABLE_NAME_MATCHES_ENVIRONMENT_VARIABLES);

            // reset variable name back to 'c'
            cy.get('#variable-label-2').clear().type('c');
            cy.get('#variable-label-2').should('not.have.class', 'field-error');
            cy.get('div#variable-name-error > p').should('not.exist');
            
            // type variable name 'ext-'
            cy.get('#variable-label-2').clear().type('ext-');
            cy.get('#variable-label-2').should('not.have.class', 'field-error');
            cy.get('div#variable-name-error > p').should('not.exist');

            // type variable name 'ext-*'
            cy.get('#variable-label-2').clear().type('ext-a');
            cy.get('#variable-label-2').should('have.class', 'field-error');
            cy.get('div#variable-name-error > p')
              .should('contain.text', constants.VARIABLE_NAME_MATCHES_ENVIRONMENT_VARIABLES);

            // type variable name 'ext-*-*'
            cy.get('#variable-label-2').clear().type('ext-a-2');
            cy.get('#variable-label-2').should('have.class', 'field-error');
            cy.get('div#variable-name-error > p')
              .should('contain.text', constants.VARIABLE_NAME_MATCHES_ENVIRONMENT_VARIABLES);
          });
      });
    });

    describe('Query', () => {
      it('should display error if the entered variable name matches with the Launch Context name', () => {
        cy.get('select#questionnaire-select').select('Query');

        // Click the button to edit the expression
        cy.get('button#openRuleEditor').should('exist').click();
        // The Rule Editor dialog should now appear
        cy.get('#rule-editor-dialog').should('exist');

        // Uneditable variables section should still only have one item
        cy.get('#uneditable-variables-section .variable-row').should('have.length', 1);
        cy.get('#uneditable-variables-section .variable-row > div.variable-column-label').should('have.text', 'patient');

        cy.get('#variables-section .variable-row').should('have.length', 3);

        // Add a variable
        cy.get('#add-variable').click();
        cy.get('#variables-section .variable-row').should('have.length', 4);

        cy.get('div#row-3')
          .within(() => {
            cy.get('#variable-label-3').should('not.have.class', 'field-error');
            cy.get('#variable-label-3').clear().type('patient');
            cy.get('#variable-label-3').should('have.class', 'field-error');
            cy.get('div#variable-name-error > p')
              .should('contain.text', constants.VARIABLE_NAME_MATCHES_LAUNCH_CONTEXT);
          });
      });
    });
  });
});