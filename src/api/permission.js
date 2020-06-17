import request from '@/utils/request'

export function getPermissionList(query) {
  return request({
    url: '/center/permission',
    method: 'get',
    params: query
  })
}

export function updatePermission(id, data) {
  return request({
    url: `/center/permission/${id}`,
    method: 'patch',
    data: data
  })
}

export function createPermission(data) {
  return request({
    url: `/center/permission`,
    method: 'post',
    data: data
  })
}

export function deletePermission(id) {
  return request({
    url: `/center/permission/${id}`,
    method: 'delete'
  })
}
