import {
  Directive,
  Input,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core'
import {
  RowData,
  TableOptions,
  TableOptionsResolved,
  createTable,
} from '@tanstack/table-core'

export * from '@tanstack/table-core'

@Directive({
  selector: '[flexRender]',
  standalone: true,
})
export class FlexRenderDirective implements OnInit {
  private _flexRender: any

  /** properties to render */
  private _flexRenderProps: any

  @Input({ required: true })
  set flexRender(render: any) {
    this._flexRender = render
  }

  @Input({ required: true })
  set flexRenderProps(props: any) {
    this._flexRenderProps = props
  }

  constructor(
    private vcr: ViewContainerRef,
    private templateRef: TemplateRef<any>
  ) {}

  ngOnInit(): void {
    // This ensures that if the 'flexRender' input is set before the directive initializes,
    // the component will be rendered when ngOnInit is called.
    if (this._flexRender) {
      this.renderComponent()
    }
  }

  renderComponent() {
    this.vcr.clear()
    if (!this._flexRender) {
      return null
    }
    if (typeof this._flexRender === 'string') {
      return this.vcr.createEmbeddedView(this.templateRef, {
        $implicit: this._flexRender,
      })
    } else if (typeof this._flexRender === 'function') {
      const componentInstance = this._flexRender(this._flexRenderProps)
      return this.vcr.createEmbeddedView(this.templateRef, {
        $implicit: componentInstance,
      })
    }
    return null
  }
}

export function createAngularTable<TData extends RowData>(
  options: TableOptions<TData>
) {
  const resolvedOptions: TableOptionsResolved<TData> = {
    state: {},
    onStateChange: () => {},
    renderFallbackValue: null,
    ...options,
  }

  let table = createTable<TData>(resolvedOptions)
  let state = table.initialState
  // Compose the default state above with any user state.
  table.setOptions((prev: any) => {
    return {
      ...prev,
      ...options,
      state: {
        ...state,
        ...options.state,
      },
      onStateChange: (updater: any) => {
        options.onStateChange?.(updater)
      },
    }
  })

  return table
}
