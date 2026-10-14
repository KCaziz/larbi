// The two refusals a route reserved to 18+ can return (P6-17), as predicates.
//
// In their own module rather than next to the component that renders them: a
// file that exports both a component and helpers breaks fast refresh, and these
// are also useful to a page that wants to decide something else.
//
//   adultsOnly  the account is a minor's — nothing to fix
//   ageUnknown  no age bracket stated — deny by default, but fixable
export const isAdultRefusal = (error) =>
  error?.status === 403 && ['adultsOnly', 'ageUnknown'].includes(error?.details?.reason);

export const adultRefusalReason = (error) => error?.details?.reason ?? null;
