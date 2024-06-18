import {createRoute} from "@tanstack/react-router";
import {rootRoute} from "../../rootRoute";
import {QueryKey, useQuery} from "@tanstack/react-query";
import {useState} from "react";
import {Select} from "antd";

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Index,
})

function Index() {
    const {data: groups, isLoading} = useQuery({
        queryKey: ['groups'],
        queryFn: () => {
            return fetch('http://127.0.0.1:8000/groups')
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                    return [];
                })

        }
    });

    console.log(groups);

    return (
      <div className="p-2">
        <h3>Welcome Home!</h3>
          {isLoading && 'loading...'}
          <Select
              loading={isLoading}
              fieldNames={{
                  label: 'name',
                  value: 'uuid'
              }}
      style={{ width: 120 }}
      options={groups}
    />
      </div>
    )
  }