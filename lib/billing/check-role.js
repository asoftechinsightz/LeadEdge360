import { ROLES }
from './roles';

export function hasRoleAccess(
 role,
 permission
){

 const perms =
 ROLES[role] || [];

 if(
   perms.includes('*')
 ){
   return true;
 }

 return perms.includes(
  permission
 );
}
