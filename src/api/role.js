import request from '@/utils/request'

export function getRoutes() {
  return request({
    url: '/center/permission',
    method: 'get'
  })
}

export function getRoles() {
  return request({
    url: '/center/role',
    method: 'get'
  })
}

export function addRole(data) {
  return request({
    url: '/center/role',
    method: 'post',
    data
  })
}

export function updateRole(id, data) {
  return request({
    url: `/center/role/${id}`,
    method: 'patch',
    data
  })
}

export function deleteRole(id) {
  return request({
    url: `/center/role/${id}`,
    method: 'delete'
  })
}
