import { Component, EventEmitter, OnInit, Input, Output, ViewChild, ElementRef, HostListener } from '@angular/core';
import { DialogStyle, DialogTypes } from '../../rule-editor.service';
import copy from 'fast-copy';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { RuleEditorService } from '../../rule-editor.service';

const confirmationDialogStyle = {
  dialogContentDiv: {
    'padding': '0px 0px 20px 0px',
    'width': '50%',
    'border-radius': '10px'
  },
  dialogTitleBar: {
    'padding': '10px 20px 10px 20px',
    'height': '20px',
    'background-color': '#3166e3',
    'color': 'white',
    'vertical-align': 'middle'
  },
  dialogHeaderDiv: {
    'margin': '30px 20px 0px 20px',
    'text-align': 'center'
  },
  dialogBodyDiv: {
    'margin': '20px',
    'text-align': 'center'
  },
  dialogFooterDiv: {
    'margin': '0px 10px',
    'text-align': 'center'
  },
  buttonPrimary: { 
    'background-color': 'navy',
    'color': 'white' 
  }
};

const helpDialogStyle = {
  dialogContentDiv: {
    'padding': '0px 0px 20px 0px',
    'width': '70%',
    'border-radius': '10px',
    'max-height': '90%'
  },
  dialogTitleBar: {
    'padding': '10px 20px 10px 20px',
    'height': '20px',
    'background-color': '#3166e3',
    'color': 'white',
    'vertical-align': 'middle'
  },
  dialogHeaderDiv: {
    'text-align': 'left'
  },
  dialogBodyDiv: {
    'margin': '20px',
    'text-align': 'left',
    'max-height': '60vh',
    'overflow-y': 'auto'
  }
};

const ruleEditorDialogStyle = {
  dialogContentDiv: { 
    'width': '90%',
    'border-radius': '10px',
    'max-height': '85vh',
    'overflow': 'hidden'
  },
  dialogTitleBar: {
    'padding': '10px 20px 10px 20px',
    'height': '20px',
    'background-color': '#3166e3',
    'color': 'white',
    'vertical-align': 'middle'
  },
  dialogHeaderDiv: {
    'margin': '30px 20px 0px 20px',
    'font-size': '24px',
    'text-align': 'left'},
  dialogBodyDiv: {
    'text-align': 'left',
    'max-height': '75vh',
    'overflow-y': 'auto'
  }
};

@Component({
  selector: 'lhc-base-dialog',
  templateUrl: './base-dialog.component.html',
  styleUrls: ['./base-dialog.component.css']
})
export class BaseDialogComponent implements OnInit {
  @Input() customDialogStyle: DialogStyle = {};
  @Input() dialogType: DialogTypes;
  @Input() displayTitleBar: boolean = true;
  @Input() titleBarLabel: string = '';
  @Input() headerLabel: string = '';
  @Input() yesButtonLabel: string = 'Yes';
  @Input() noButtonLabel: string = 'No';
  @Input() yesButtonId: string = 'yes-button';
  @Input() noButtonId: string = 'no-button';
  @Input() enableOverlayClick: boolean = true;
  @Input() name: string = '';

  @Output() yes: EventEmitter<any> = new EventEmitter<any>();
  @Output() no: EventEmitter<any> = new EventEmitter<any>();
  @Output() dialogClose: EventEmitter<any> = new EventEmitter<any>();
  
  @ViewChild('overlay') overlayRef: ElementRef;
  @ViewChild('modal') modal: ElementRef;

  dialogStyle = {
    'dialogTitleBar': {},
    'dialogContentDiv': {},
    'dialogHeaderDiv': {},
    'dialogBodyDiv': {},
    'dialogFooterDiv': {},
    'buttonPrimary': {},
    'buttonSecondary': {}
  };

  timeout = 0;
  dialogName = "";

  constructor(protected liveAnnouncer: LiveAnnouncer, protected ruleEditorService?: RuleEditorService ) {};

  /**
   * Angular lifecycle hook called when the component is initialized
   */
  ngOnInit(): void {
    let tmpDialogStyle;
    if (this.dialogType === DialogTypes.Confirmation) {
      tmpDialogStyle = copy(confirmationDialogStyle);
    } else if (this.dialogType === DialogTypes.Help) {
      tmpDialogStyle = copy(helpDialogStyle);
    } else {
      tmpDialogStyle = copy(ruleEditorDialogStyle);
    }

    this.dialogStyle = this.applyCustomDialogStyle(tmpDialogStyle, this.customDialogStyle);

    if (!this.name)
      this.name = (this.dialogType) ? this.dialogType : "rule-editor";

    this.dialogName = `#${this.name}-base-dialog > div`;

    if (this.ruleEditorService &&
        this.ruleEditorService.dialogStack.contains(this.dialogName)) {
      this.ruleEditorService.dialogStack.push(this.dialogName);
    }
  }



  /**
   * If provide, apply custom css styles to the default css styles
   * @param sourceDialogStyle - default css styles for the selected type
   * @param customDialogStyle - custom css to override the default style
   * @returns updated css styles
   */
  applyCustomDialogStyle(sourceDialogStyle, customDialogStyle) {
    Object.keys(customDialogStyle).forEach((key) => {
      const val = customDialogStyle[key];
      Object.keys(val).forEach((propKey) => {
        const propVal = val[propKey];
        const dashedPropKey = propKey.replace(/[A-Z]/g, m => "-" + m.toLowerCase());
        if (key in sourceDialogStyle)
        sourceDialogStyle[key][dashedPropKey] = propVal;
      });
    });

    return sourceDialogStyle;
  };


  /**
   * Emits the 'yes' event
   */
  onYes(): void {
    if(this.ruleEditorService.dialogStack.peek() === '#cancel-changes-base-dialog > div') {
      this.ruleEditorService.dialogStack.pop();
    }

    setTimeout(() => {
      this.yes.emit();
    }, this.timeout);
  }

  /**
   * Emits the 'no' event
   */
  onNo(): void {
    if (this.dialogName !== "#rule-editor-base-dialog > div")
      this.ruleEditorService.dialogStack.pop();

    setTimeout(() => {
      this.no.emit();
    }, this.timeout);
  }

  /**
   * Emits the 'dialogClose' event
   */
  onDialogClose(): void {
    if (this.dialogName !== "#rule-editor-base-dialog > div")
      this.ruleEditorService.dialogStack.pop();

    setTimeout(() => {
      this.dialogClose.emit();
    }, this.timeout);
  }

  /**
   * Close Modal from the Overlay - allowed the modal to be closed
   * if clicking outside of the modal
   * @param event - mouse click event
   */
  @HostListener('document:click', ['$event'])
  overlayClose(event) {
    if (this.enableOverlayClick) {
      if (event.target && event.target instanceof HTMLDivElement) {
        if (this.ruleEditorService && this.ruleEditorService.dialogStack.size() === 0) {
          this.ruleEditorService.dialogStack.push(this.dialogName);
        }

        if (!event.target.closest(this.dialogName) &&
            (this.ruleEditorService && this.ruleEditorService.dialogStack.peek() === this.dialogName)) {
          this.onDialogClose();
          event.stopPropagation();
          
          if (this.dialogName !== "#rule-editor-base-dialog > div")
            this.ruleEditorService.dialogStack.pop();
        }
      }
    }
  }
}
