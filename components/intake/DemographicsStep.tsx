import type { UseFormReturn } from "react-hook-form";

import { Field } from "@/components/intake/Field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatPhone } from "@/lib/format";
import type { IntakeFormValues } from "@/lib/validations";

const TODAY = new Date().toISOString().slice(0, 10);

export function DemographicsStep({ form }: { form: UseFormReturn<IntakeFormValues> }) {
  const { register, setValue, formState } = form;
  const errors = formState.errors;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="firstName" label="First name" error={errors.firstName?.message}>
        <Input id="firstName" autoComplete="given-name" placeholder="Jane" {...register("firstName")} />
      </Field>

      <Field id="lastName" label="Last name" error={errors.lastName?.message}>
        <Input id="lastName" autoComplete="family-name" placeholder="Doe" {...register("lastName")} />
      </Field>

      <div className="sm:col-span-2">
        <Field id="email" label="Email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="jane@example.com"
            {...register("email")}
          />
        </Field>
      </div>

      <Field id="phone" label="Phone" error={errors.phone?.message}>
        <Input
          id="phone"
          type="tel"
          autoComplete="tel"
          placeholder="(555) 123-4567"
          {...register("phone")}
          onChange={(e) =>
            setValue("phone", formatPhone(e.target.value), { shouldDirty: true })
          }
        />
      </Field>

      <Field id="dateOfBirth" label="Date of birth" error={errors.dateOfBirth?.message}>
        <Input
          id="dateOfBirth"
          type="date"
          autoComplete="bday"
          max={TODAY}
          {...register("dateOfBirth")}
        />
      </Field>

      <div className="sm:col-span-2">
        <Field id="address" label="Address" error={errors.address?.message}>
          <Textarea
            id="address"
            rows={2}
            autoComplete="street-address"
            placeholder="123 Main St, Apt 4, San Francisco, CA 94110"
            {...register("address")}
          />
        </Field>
      </div>
    </div>
  );
}
