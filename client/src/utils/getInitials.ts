export const getInitials = (name: string) => {
  return name ? name.substring(0, 2).toUpperCase() : '??'
}
