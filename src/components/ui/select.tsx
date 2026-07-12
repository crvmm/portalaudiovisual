"use client";

import ReactSelect, {
  type ClearIndicatorProps,
  type DropdownIndicatorProps,
  type GroupBase,
  type MultiValueProps,
  type Props as ReactSelectProps,
  type SingleValueProps,
  type StylesConfig,
  components,
} from "react-select";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
};

export function optionsFromRecord(record: Record<string, string>): SelectOption[] {
  return Object.entries(record).map(([value, label]) => ({ value, label }));
}

export function optionsWithEmpty(
  record: Record<string, string>,
  emptyLabel: string
): SelectOption[] {
  return [{ value: "", label: emptyLabel }, ...optionsFromRecord(record)];
}

type BaseSelectStyles = StylesConfig<SelectOption, boolean, GroupBase<SelectOption>>;

const baseSelectStyles: BaseSelectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "2.5rem",
    borderRadius: "0.375rem",
    borderColor: state.isFocused ? "var(--primary)" : "var(--border)",
    backgroundColor: "var(--card)",
    boxShadow: state.isFocused ? "0 0 0 1px var(--ring)" : "none",
    cursor: "pointer",
    transition: "border-color 0.15s, box-shadow 0.15s",
    "&:hover": {
      borderColor: state.isFocused ? "var(--primary)" : "var(--border)",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0.3125rem 0.5rem",
    gap: "0.25rem",
    flexWrap: "wrap",
  }),
  singleValue: (base) => ({
    ...base,
    position: "static",
    transform: "none",
    maxWidth: "calc(100% - 0.5rem)",
    margin: 0,
    color: "var(--foreground)",
    fontSize: "0.875rem",
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--muted-foreground)",
    fontSize: "0.875rem",
  }),
  input: (base) => ({
    ...base,
    color: "var(--foreground)",
    fontSize: "0.875rem",
    margin: 0,
    padding: 0,
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.375rem",
    border: "1px solid var(--border)",
    backgroundColor: "var(--card)",
    boxShadow: "0 8px 24px oklch(0.26 0.04 290 / 0.08)",
    overflow: "hidden",
    zIndex: 50,
  }),
  menuList: (base) => ({
    ...base,
    padding: "0.25rem",
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.875rem",
    borderRadius: "0.25rem",
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? "var(--primary)"
      : state.isFocused
        ? "var(--accent)"
        : "transparent",
    color: state.isSelected ? "var(--primary-foreground)" : "var(--foreground)",
    "&:active": {
      backgroundColor: state.isSelected ? "var(--primary)" : "var(--muted)",
    },
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "var(--muted-foreground)",
    opacity: 0.6,
    paddingRight: "1rem",
    paddingLeft: "0.25rem",
    "&:hover": {
      color: "var(--muted-foreground)",
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "var(--muted-foreground)",
    opacity: 0.6,
    padding: "0 0.25rem",
    "&:hover": {
      color: "var(--foreground)",
    },
  }),
  loadingIndicator: (base) => ({
    ...base,
    color: "var(--primary)",
  }),
  noOptionsMessage: (base) => ({
    ...base,
    fontSize: "0.875rem",
    color: "var(--muted-foreground)",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "transparent",
    margin: 0,
    padding: 0,
  }),
  multiValueLabel: (base) => ({
    ...base,
    padding: 0,
    fontSize: "0.875rem",
    color: "var(--foreground)",
  }),
  multiValueRemove: () => ({
    display: "none",
  }),
};

const selectStyles = baseSelectStyles as StylesConfig<
  SelectOption,
  false,
  GroupBase<SelectOption>
>;

const multiSelectStyles = baseSelectStyles as StylesConfig<
  SelectOption,
  true,
  GroupBase<SelectOption>
>;

interface SelectProps {
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isClearable?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  required?: boolean;
  className?: string;
  noOptionsMessage?: string;
}

interface MultiSelectProps {
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  isClearable?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
  noOptionsMessage?: string;
}

function DropdownIndicator(
  props: DropdownIndicatorProps<SelectOption, boolean, GroupBase<SelectOption>>
) {
  return (
    <components.DropdownIndicator {...props}>
      <ChevronDown size={18} strokeWidth={2} aria-hidden />
    </components.DropdownIndicator>
  );
}

function ClearIndicator(
  props: ClearIndicatorProps<SelectOption, boolean, GroupBase<SelectOption>>
) {
  return (
    <components.ClearIndicator {...props}>
      <X size={16} strokeWidth={2} aria-hidden />
    </components.ClearIndicator>
  );
}

function SelectChip({
  children,
  onRemoveInnerProps,
}: {
  children: React.ReactNode;
  onRemoveInnerProps?: React.HTMLAttributes<HTMLDivElement>;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-md border border-primary/35 bg-primary/10 py-0.5 pl-2.5 pr-1 text-sm font-medium leading-5 text-foreground">
      <span className="truncate">{children}</span>
      {onRemoveInnerProps && (
        <div
          {...onRemoveInnerProps}
          className="shrink-0 cursor-pointer rounded p-0.5 text-primary/65 transition-colors hover:bg-primary/15 hover:text-primary"
          aria-label="Quitar selección"
        >
          <X size={14} strokeWidth={2} aria-hidden />
        </div>
      )}
    </span>
  );
}

function ChipSingleValue(
  props: SingleValueProps<SelectOption, boolean, GroupBase<SelectOption>>
) {
  const { children, data, selectProps } = props;
  const showRemove = selectProps.isClearable && !selectProps.isDisabled;

  const removeInnerProps = showRemove
    ? {
        onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => {
          event.preventDefault();
          event.stopPropagation();
        },
        onClick: (event: React.MouseEvent<HTMLDivElement>) => {
          event.preventDefault();
          event.stopPropagation();
          selectProps.onChange(null, {
            action: "clear",
            removedValues: [data],
          });
        },
        onTouchEnd: (event: React.TouchEvent<HTMLDivElement>) => {
          event.preventDefault();
          event.stopPropagation();
        },
      }
    : undefined;

  return (
    <components.SingleValue {...props}>
      <SelectChip onRemoveInnerProps={removeInnerProps}>{children}</SelectChip>
    </components.SingleValue>
  );
}

function ChipMultiValue(
  props: MultiValueProps<SelectOption, boolean, GroupBase<SelectOption>>
) {
  const { data, removeProps, innerProps } = props;

  return (
    <div {...innerProps} className="m-0.5">
      <SelectChip onRemoveInnerProps={removeProps}>{data.label}</SelectChip>
    </div>
  );
}

function SelectClearIndicator(
  props: ClearIndicatorProps<SelectOption, boolean, GroupBase<SelectOption>>
) {
  if (props.selectProps.value && props.selectProps.isClearable) {
    return null;
  }

  return <ClearIndicator {...props} />;
}

function MultiSelectClearIndicator(
  props: ClearIndicatorProps<SelectOption, boolean, GroupBase<SelectOption>>
) {
  return <ClearIndicator {...props} />;
}

export function Select({
  id,
  name,
  label,
  error,
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  isClearable = false,
  isDisabled = false,
  isLoading = false,
  required = false,
  className,
  noOptionsMessage = "Sin resultados",
}: SelectProps) {
  const selected = options.find((option) => option.value === value) ?? null;

  const handleChange: ReactSelectProps<SelectOption, false>["onChange"] = (option) => {
    onChange(option?.value ?? "");
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
      )}
      <ReactSelect<SelectOption, false>
        inputId={id}
        instanceId={id}
        options={options}
        value={selected}
        onChange={handleChange}
        placeholder={placeholder}
        isClearable={isClearable}
        isDisabled={isDisabled}
        isLoading={isLoading}
        required={required}
        styles={selectStyles}
        components={{
          DropdownIndicator,
          ClearIndicator: SelectClearIndicator,
          SingleValue: ChipSingleValue,
        }}
        noOptionsMessage={() => noOptionsMessage}
        classNamePrefix="pa-select"
        classNames={{
          control: () => cn(error && "!border-red-500"),
        }}
      />
      {name && <input type="hidden" name={name} value={value} />}
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}

export function MultiSelect({
  id,
  name,
  label,
  error,
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  isClearable = true,
  isDisabled = false,
  isLoading = false,
  className,
  noOptionsMessage = "Sin resultados",
}: MultiSelectProps) {
  const selected = options.filter((option) => value.includes(option.value));

  const handleChange: ReactSelectProps<SelectOption, true>["onChange"] = (options) => {
    onChange(options?.map((option) => option.value) ?? []);
  };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
          {label}
        </label>
      )}
      <ReactSelect<SelectOption, true>
        inputId={id}
        instanceId={id}
        isMulti
        closeMenuOnSelect={false}
        options={options}
        value={selected}
        onChange={handleChange}
        placeholder={placeholder}
        isClearable={isClearable}
        isDisabled={isDisabled}
        isLoading={isLoading}
        styles={multiSelectStyles}
        components={{
          DropdownIndicator,
          ClearIndicator: MultiSelectClearIndicator,
          MultiValue: ChipMultiValue,
        }}
        noOptionsMessage={() => noOptionsMessage}
        classNamePrefix="pa-select"
        classNames={{
          control: () => cn(error && "!border-red-500"),
        }}
      />
      {name && <input type="hidden" name={name} value={value.join(",")} />}
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
