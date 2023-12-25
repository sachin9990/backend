import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

// material-ui
import { Box, List, Typography } from '@mui/material';

// project import
import NavItem from './NavItem';
import { selectCurrentUserData } from 'store/reducers/auth/authslice';
import { userRoles } from 'constants';
import { useGetAppPermissionsBasedOnUserRoleMutation } from 'store/reducers/apps/appApiSlice';
import { useEffect, useState } from 'react';

// ==============================|| NAVIGATION - LIST GROUP ||============================== //

const NavGroup = ({ item }) => {
  const userData = useSelector(selectCurrentUserData);
  const [mainAppList, setMainAppList] = useState([]);
  const [appListsWithId, setAppListsWithId] = useState([]);

  // const { data: apps, isSuccess } = useGetAppsQuery();
  // Get app permissions according to the user log in's roleId
  const [userRolePermissions] = useGetAppPermissionsBasedOnUserRoleMutation();

  const urlArr = [
    { appId: 'azure-build-planner', url: '/azure-build-Planner' },
    { appId: 'change-and-incident-log', url: '/change-and-incident-log' },
    { appId: 'announce', url: '/announce' },
    { appId: 'customer-reporting', url: '/customer-reporting' }
  ];

  const combinedArr = urlArr
    .map((urlItem) => {
      const matchingApp = appListsWithId.find((appItem) => appItem.appId === urlItem.appId);

      // Check if matchingApp is found before combining
      if (matchingApp) {
        return { ...urlItem, appName: matchingApp.appName };
      }

      // If appId is not available in arr1, you can choose to handle it accordingly.
      // For now, returning null.
      return null;
    })
    .filter((item) => item !== null);

  console.log('combinedArr--------->', combinedArr);
  console.log('item.children--------->', item.children);

  const menu = useSelector((state) => state.menu);

  const { drawerOpen } = menu;

  // const filteredMenuItems = item?.children?.filter((menuItem) => {
  //   // console.log('menuItem.type----------->', menuItem.type);

  //   return (
  //     combinedArr.some((combinedItem) => combinedItem.appId === menuItem.id) &&
  //     (menuItem.id !== 'client-company-management' || (userData?.roleName !== userRoles.ADMIN && userData?.roleName !== 'app admin'))
  //   );
  // });

  // console.log('filteredMenuItems----->', filteredMenuItems);

  const filteredMenuItems = item?.children
    ?.map((menuItem) => {
      if (menuItem.type === 'tabs') {
        // For 'tabs' type, include the item without any condition
        // return menuItem;
        return menuItem;
      }

      // For 'apps' type, include the item only if there is a match in combinedArr
      const matchingApp = combinedArr.find((combinedItem) => combinedItem.appId === menuItem.id);

      if (matchingApp) {
        return {
          ...menuItem,
          url: matchingApp.url,
          appName: matchingApp.appName
        };
      }

      // Exclude the item if there is no match in combinedArr
      return null;
    })
    .filter(Boolean); // Remove null entries

  console.log(filteredMenuItems);

  useEffect(() => {
    if (userData?.roleName !== userRoles.SUPER_ADMIN) {
      const fetchData = async () => {
        const response = await userRolePermissions(userData?.roleName);

        setMainAppList(response?.data?.mainAppList?.map((appItem) => appItem.appName));
        setAppListsWithId(response?.data?.mainAppList);
      };
      fetchData();
    }
  }, []);

  const navCollapse = filteredMenuItems?.map((menuItem, index) => {
    let updatedItem;
    let alteredAppName;
    let combinedItem;
    switch (menuItem.type) {
      case 'collapse':
        return (
          <Typography key={menuItem.id} variant="caption" color="error" sx={{ p: 2.5 }}>
            Collapse
          </Typography>
        );
      case 'apps':
        // alteredAppName = mainAppList && mainAppList[index] ? mainAppList[index] : '';
        // combinedItem = combinedArr && combinedArr[index];

        // updatedItem = { ...menuItem, title: alteredAppName, url: url };
        // updatedItem = { ...menuItem, title: alteredAppName, url: combinedItem ? combinedItem.url : '' };

        return <NavItem key={menuItem.id} item={menuItem} level={1} />;
      case 'tabs':
        return <NavItem key={menuItem.id} item={menuItem} level={1} />;
      default:
        return (
          <Typography key={menuItem.id} variant="h6" color="error" align="center">
            Fix - Group Collapse or Items
          </Typography>
        );
    }
  });

  return (
    <List
      subheader={
        item.title &&
        drawerOpen && (
          <Box sx={{ pl: 3, mb: 1.5 }}>
            <Typography variant="subtitle2" color="textSecondary">
              {item.title}
            </Typography>
          </Box>
        )
      }
      sx={{ mb: drawerOpen ? 1.5 : 0, py: 0, zIndex: 0 }}
    >
      {navCollapse}
    </List>
  );
};

NavGroup.propTypes = {
  item: PropTypes.object
};

export default NavGroup;




const filteredMenuItems = item?.children.filter(
  (item) => item.id !== 'client-company-management' || (userData?.roleName !== userRoles.ADMIN && userData?.roleName !== 'app admin')
);