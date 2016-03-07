describe('navigatorStore', function() {
  'use strict';

  var store;
  var httpBackend;

  beforeEach(module('hbpCollaboratoryNavStore'));

  beforeEach(inject(function($httpBackend, hbpCollaboratoryNavStore) {
    httpBackend = $httpBackend;
    store = hbpCollaboratoryNavStore;
  }));

  // Prevent request mismatch
  afterEach(function() {
    httpBackend.verifyNoOutstandingExpectation();
    httpBackend.verifyNoOutstandingRequest();
  });

  describe('insertAt', function() {
    var parent;
    var nav;
    var collabId;
    var child;

    beforeEach(function() {
      collabId = 1;
      parent = new store.NavItem({id: 22, collabId: collabId}).ensureCached();
      child = new store.NavItem({id: 44, collabId: collabId}).ensureCached();
      nav = new store.NavItem(
        {id: 33, collabId: collabId, children: [child]}
      ).ensureCached();
    });

    it('should keep its children after completion', inject(function(bbpConfig) {
      var result;
      var url = bbpConfig.get('api.collab.v0') + '/collab/1/nav/33/';
      httpBackend.expectPUT(url)
      .respond(200, {
        id: 33,
        parentId: 22,
        collabId: collabId,
        children: [{
          id: 44,
          collabId: collabId
        }]
      });
      store.insertNode(collabId, nav, parent, 0).then(function(r) {
        result = r;
      });
      httpBackend.flush(1);
      expect(result).toBeDefined();
      expect(result).toBe(nav);
      expect(nav.children[0]).toBe(child, 'the object reference shoud remain');
    }));
  });

  describe('NavItem', function() {
    var requiredProperties;
    var baseNav;
    var navFolder;
    var navItem;
    var navExt;

    beforeEach(function() {
      requiredProperties = ['type', 'app_id',
        'context', 'name', 'order_index', 'parent', 'collab'];
      baseNav = {
        parentId: 22,
        collabId: 11,
        order: -1,
        name: 'xyz',
        appId: 33,
        context: 'hgj'
      };
      navFolder = new store.NavItem(angular.extend(baseNav, {
        folder: true
      }));
      navItem = new store.NavItem(angular.extend(baseNav, {
        folder: false
      }));
      navExt = new store.NavItem(angular.extend(baseNav, {
        folder: false,
        type: 'EX'
      }));
    });

    describe('.toJson', function() {
      var navFolderJson;
      var navItemJson;
      var navExtJson;

      beforeEach(function() {
        navFolderJson = navFolder.toJson();
        navItemJson = navItem.toJson();
        navExtJson = navExt.toJson();
      });

      it('should serialize all the required fields', function() {
        expect(navFolderJson).toDefine(requiredProperties);
        expect(navItemJson).toDefine(requiredProperties);
        expect(navExtJson).toDefine(requiredProperties);
      });

      it('should set type properly', function() {
        expect(navFolderJson.type).toBe('FO');
        expect(navItemJson.type).toBe('IT');
        expect(navExtJson.type).toBe('EX');
      });
    });
  });
});
